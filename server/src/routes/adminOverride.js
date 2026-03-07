import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import Booking from "../models/booking.model.js";
import BookingEvent from "../models/bookingevent.model.js";

const router = express.Router();

/**
 * POST /admin/bookings/:bookingId/override
 */
router.post(
  "/admin/bookings/:bookingId/override",
  clerkAuth,
  requireAdmin,
  async (req, res) => {
    const adminId = req.dbUser._id;
    const { bookingId } = req.params;
    const { new_resource_id, new_start_time, new_end_time, reason } = req.body;

    if (!new_resource_id || !new_start_time || !new_end_time || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Fetch original booking
      const original = await Booking.findById(bookingId);

      if (!original) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (!["APPROVED", "PENDING"].includes(original.status)) {
        return res.status(409).json({
          error: "Only active bookings can be overridden",
        });
      }

      // Conflict check for new slot
      const conflict = await Booking.findOne({
        resourceId: new_resource_id,
        status: { $in: ["PENDING", "APPROVED"] },
        startTime: { $lt: new Date(new_end_time) },
        endTime: { $gt: new Date(new_start_time) },
      });

      if (conflict) {
        return res.status(409).json({
          error: "New slot conflicts with existing booking",
        });
      }

      // Create new booking
      const newBooking = await Booking.create({
        resourceId: new_resource_id,
        userId: original.userId,
        startTime: new Date(new_start_time),
        endTime: new Date(new_end_time),
        purpose: original.purpose,
        status: "APPROVED",
        approvedBy: adminId,
        approvedAt: new Date(),
      });

      // Mark original as cancelled
      original.status = "CANCELLED";
      await original.save();

      // History: overridden
      await BookingEvent.create({
        bookingId,
        eventType: "CANCELLED",
        createdBy: adminId,
        metadata: {
          reason,
          note: "Overridden by admin",
          newBookingId: newBooking._id,
        },
      });

      // History: new booking created
      await BookingEvent.create({
        bookingId: newBooking._id,
        eventType: "CREATED",
        createdBy: adminId,
        metadata: {
          note: "Created by admin override",
          replacedBookingId: bookingId,
        },
      });

      res.json({
        success: true,
        old_booking_id: bookingId,
        new_booking_id: newBooking._id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
