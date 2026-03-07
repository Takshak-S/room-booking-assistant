import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import Booking from "../models/booking.model.js";
import BookingEvent from "../models/bookingevent.model.js";

const router = express.Router();

/**
 * GET /admin/bookings/pending — list all pending bookings
 */
router.get(
  "/admin/bookings/pending",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const bookings = await Booking.find({ status: "PENDING" })
        .populate("resourceId", "name type")
        .populate("userId", "name email")
        .sort({ createdAt: 1 });

      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * POST /admin/bookings/:bookingId/approve
 */
router.post(
  "/admin/bookings/:bookingId/approve",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    const adminId = req.dbUser._id;
    const { bookingId } = req.params;

    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== "PENDING") {
        return res
          .status(409)
          .json({ error: "Booking is not pending approval" });
      }

      // Re-check conflicts
      const conflict = await Booking.findOne({
        resourceId: booking.resourceId,
        _id: { $ne: booking._id },
        status: { $in: ["PENDING", "APPROVED"] },
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
      });

      if (conflict) {
        return res.status(409).json({
          error: "Conflict detected with another booking",
        });
      }

      booking.status = "APPROVED";
      booking.approvedBy = adminId;
      booking.approvedAt = new Date();
      await booking.save();

      await BookingEvent.create({
        bookingId,
        eventType: "APPROVED",
        createdBy: adminId,
      });

      res.json({ success: true, status: "APPROVED" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * POST /admin/bookings/:bookingId/reject
 */
router.post(
  "/admin/bookings/:bookingId/reject",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    const adminId = req.dbUser._id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== "PENDING") {
        return res
          .status(409)
          .json({ error: "Booking is not pending approval" });
      }

      booking.status = "REJECTED";
      booking.rejectedBy = adminId;
      booking.rejectedAt = new Date();
      booking.rejectionReason = reason;
      await booking.save();

      await BookingEvent.create({
        bookingId,
        eventType: "REJECTED",
        createdBy: adminId,
        metadata: { reason },
      });

      res.json({ success: true, status: "REJECTED" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
