import { requireAuth, getAuth, clerkClient } from "@clerk/express";
import User from "../models/user.model.js";
import { inferRoleFromEmail } from "../utils/inferRole.js";


async function attachDbUser(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    
    let user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      
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


export const clerkAuth = [requireAuth(), attachDbUser];
