import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import Booking from "../models/booking.model.js";
import BookingEvent from "../models/bookingevent.model.js";

const router = express.Router();


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


router.get(
  "/admin/bookings/overrides",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const bookings = await Booking.find({ status: "OVERRIDE_PENDING" })
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


router.post(
  "/admin/bookings/:bookingId/approve-override",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    const adminId = req.dbUser._id;
    const { bookingId } = req.params;

    try {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.status !== "OVERRIDE_PENDING") {
        return res
          .status(404)
          .json({ error: "Override request not found or not pending" });
      }

      
      const conflicts = await Booking.find({
        resourceId: booking.resourceId,
        status: { $in: ["PENDING", "APPROVED"] },
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
        _id: { $ne: booking._id },
      });

      
      for (const c of conflicts) {
        c.status = "CANCELLED";
        await c.save();
        await BookingEvent.create({
          bookingId: c._id,
          eventType: "CANCELLED",
          createdBy: adminId,
          metadata: { note: "Cancelled due to admin override approval" },
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
        metadata: { note: "Approved via override request" },
      });

      res.json({ success: true, cancelled_count: conflicts.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
