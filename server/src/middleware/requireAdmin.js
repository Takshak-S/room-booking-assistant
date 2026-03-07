/**
 * Check if the authenticated user is an ADMIN.
 * Expects req.dbUser to be set by the clerkAuth middleware.
 */
export default function requireAdmin(req, res, next) {
  if (req.dbUser?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
