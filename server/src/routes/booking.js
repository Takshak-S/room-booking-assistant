import express from "express";
import mongoose from "mongoose";
import { clerkAuth } from "../middleware/auth.js";
import Booking from "../models/booking.model.js";
import BookingEvent from "../models/bookingevent.model.js";
import Resource from "../models/resource.model.js";

const router = express.Router();

router.get("/bookings/history", clerkAuth, async (req, res) => {
  try {
    const userId = req.dbUser._id;

    const bookings = await Booking.find({ userId })
      .populate("resourceId", "name type")
      .sort({ startTime: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/bookings", clerkAuth, async (req, res) => {
  const userId = req.dbUser._id;
  const {
    resource_id,
    start_time,
    end_time,
    purpose,
    is_override,
    override_reason,
  } = req.body;

  if (!resource_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return res.status(400).json({ error: "Invalid time range" });
  }

  try {
    const resource = await Resource.findById(resource_id);
    if (!resource || !resource.available) {
      return res
        .status(404)
        .json({ error: "Resource not found or unavailable" });
    }

    const session = await mongoose.startSession();
    let booking_id;
    let b_status;

    await session.withTransaction(async () => {
      const conflict = await Booking.findOne({
        resourceId: resource_id,
        status: { $in: ["PENDING", "APPROVED"] },
        startTime: { $lt: new Date(end_time) },
        endTime: { $gt: new Date(start_time) },
      }).session(session);

      const hasConflict = !!conflict;
      if (hasConflict && !is_override) {
        throw new Error("CONFLICT");
      }

      const booking = await Booking.create(
        [
          {
            resourceId: resource_id,
            userId,
            startTime: new Date(start_time),
            endTime: new Date(end_time),
            purpose,
            status: (hasConflict && is_override) ? "OVERRIDE_PENDING" : "PENDING",
            overrideReason: (hasConflict && is_override) ? override_reason : undefined,
          },
        ],
        { session },
      );

      booking_id = booking[0]._id;
      b_status = booking[0].status;

      await BookingEvent.create(
        [
          {
            bookingId: booking_id,
            eventType: "CREATED",
            createdBy: userId,
            metadata: { purpose },
          },
        ],
        { session },
      );
    });

    await session.endSession();

    res.json({
      success: true,
      booking_id,
      status: b_status,
    });
  } catch (err) {
    if (err.message === "CONFLICT") {
      return res
        .status(409)
        .json({ error: "Time slot already booked or pending approval" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/bookings/:id/cancel", clerkAuth, async (req, res) => {
  const userId = req.dbUser._id;
  const { id } = req.params;

  try {
    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (new Date(booking.endTime) <= new Date()) {
      return res.status(400).json({ error: "Cannot cancel past booking" });
    }

    booking.status = "CANCELLED";
    await booking.save();

    await BookingEvent.create({
      bookingId: id,
      eventType: "CANCELLED",
      createdBy: userId,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/bookings/:id", clerkAuth, async (req, res) => {
  const userId = req.dbUser._id;
  const { id } = req.params;
  const { start_time, end_time, resource_id } = req.body;

  try {
    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (new Date(booking.endTime) <= new Date()) {
      return res.status(400).json({ error: "Cannot edit past booking" });
    }

    const finalResource = resource_id || booking.resourceId;
    const finalStart = start_time ? new Date(start_time) : booking.startTime;
    const finalEnd = end_time ? new Date(end_time) : booking.endTime;

    const resource = await Resource.findById(finalResource);
    if (!resource || !resource.available) {
      return res
        .status(404)
        .json({ error: "Resource not found or unavailable" });
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const conflict = await Booking.findOne({
        _id: { $ne: id },
        resourceId: finalResource,
        status: { $in: ["PENDING", "APPROVED"] },
        startTime: { $lt: finalEnd },
        endTime: { $gt: finalStart },
      }).session(session);

      if (conflict) {
        throw new Error("CONFLICT");
      }

      if (start_time) booking.startTime = new Date(start_time);
      if (end_time) booking.endTime = new Date(end_time);
      if (resource_id) booking.resourceId = resource_id;
      booking.status = "PENDING";
      await booking.save({ session });

      await BookingEvent.create(
        [
          {
            bookingId: id,
            eventType: "CREATED",
            createdBy: userId,
            metadata: {
              note: "Booking edited",
              startTime: start_time,
              endTime: end_time,
              resourceId: resource_id,
            },
          },
        ],
        { session },
      );
    });

    await session.endSession();
    res.json({ success: true });
  } catch (err) {
    if (err.message === "CONFLICT") {
      return res
        .status(409)
        .json({ error: "Time slot already booked or pending approval" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
