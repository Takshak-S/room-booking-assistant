import { requireAuth, getAuth, clerkClient } from "@clerk/express";
import User from "../models/user.model.js";
import { inferRoleFromEmail } from "../utils/inferRole.js";

/**
 * Clerk auth middleware chain:
 * 1. requireAuth() — verifies the Clerk JWT, returns 401 if invalid
 * 2. attachDbUser  — looks up (or creates) the MongoDB User by Clerk userId
 *
 * Usage in routes:  router.get("/path", clerkAuth, async (req, res) => { ... })
 * Access user via:  req.dbUser
 */
async function attachDbUser(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Look up existing user by Clerk ID
    let user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      // First login — fetch profile from Clerk and auto-create
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        email;

      const role = inferRoleFromEmail(email);

      if (!role) {
        return res.status(403).json({ error: "Unauthorized email domain" });
      }

      user = await User.create({
        firebaseUid: userId,
        email,
        name,
        role,
        approved: false,
      });
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error("attachDbUser error:", err);
    res.status(500).json({ error: "Auth middleware failed" });
  }
}

// Export a middleware array: first verify Clerk JWT, then attach DB user
export const clerkAuth = [requireAuth(), attachDbUser];
