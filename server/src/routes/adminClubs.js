import express from "express";
import supabase from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import  requireAdmin  from "../middleware/requireAdmin.js";

const router = express.Router();

router.post("/admin/clubs", requireAuth, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Club name required" });
  }

  if (!(await requireAdmin(userId))) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { error } = await supabase.from("clubs").insert({ name });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

router.get("/clubs", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name")
    .order("name");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/*
{
  "user_id": "uuid",
  "designation": "Technical Head"
}

*/

router.post(
  "/admin/clubs/:clubId/board-members",
  requireAuth,
  async (req, res) => {
    const adminId = req.user.id;
    const { clubId } = req.params;
    const { user_id, designation } = req.body;

    if (!(await requireAdmin(adminId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { error } = await supabase.from("club_members").upsert({
      user_id,
      club_id: clubId,
      role: "BOARD",
      designation,
      assigned_by: adminId,
      is_active: true,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  },
);

router.delete(
  "/admin/clubs/:clubId/board-members/:userId",
  requireAuth,
  async (req, res) => {
    const adminId = req.user.id;
    const { clubId, userId } = req.params;

    if (!(await requireAdmin(adminId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { error } = await supabase
      .from("club_members")
      .update({ is_active: false })
      .eq("club_id", clubId)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  },
);

export default router;
