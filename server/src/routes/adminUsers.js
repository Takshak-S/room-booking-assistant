import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

const router = express.Router();

/**
 * GET /admin/users/pending — users awaiting approval
 */
router.get(
  "/admin/users/pending",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find({ approved: false }).sort({
        createdAt: -1,
      });
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * POST /admin/users/:userId/approve — approve a user
 */
router.post(
  "/admin/users/:userId/approve",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.approved = true;
      user.approvedBy = req.dbUser._id;
      user.approvedAt = new Date();
      await user.save();

      res.json({ success: true, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * GET /admin/users — all users (with optional role filter)
 */
router.get("/admin/users", clerkAuth, requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).sort({ role: 1, createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/bookings — all bookings (with optional status / date filters)
 *   ?status=APPROVED&from=2026-03-01&to=2026-03-07
 */
router.get("/admin/bookings", clerkAuth, requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.startTime = {};
      if (req.query.from) filter.startTime.$gte = new Date(req.query.from);
      if (req.query.to)
        filter.startTime.$lte = new Date(req.query.to + "T23:59:59");
    }

    const bookings = await Booking.find(filter)
      .populate("resourceId", "name type")
      .populate("userId", "name email role")
      .sort({ startTime: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/bookings/by-date — date-wise venue occupancy
 *   ?date=2026-03-07  (defaults to today)
 */
router.get(
  "/admin/bookings/by-date",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
      const dayStart = new Date(dateStr + "T00:00:00");
      const dayEnd = new Date(dateStr + "T23:59:59");

      const bookings = await Booking.find({
        status: { $in: ["APPROVED", "PENDING"] },
        startTime: { $lte: dayEnd },
        endTime: { $gte: dayStart },
      })
        .populate("resourceId", "name type")
        .populate("userId", "name email role")
        .sort({ startTime: 1 });

      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
