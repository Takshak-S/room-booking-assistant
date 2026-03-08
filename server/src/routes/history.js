import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import Booking from "../models/booking.model.js";
import BookingEvent from "../models/bookingevent.model.js";

const router = express.Router();


router.get("/bookings/:bookingId/history", clerkAuth, async (req, res) => {
  const userId = req.dbUser._id;
  const isAdmin = req.dbUser.role === "ADMIN";
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    
    if (!isAdmin && !booking.userId.equals(userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const events = await BookingEvent.find({ bookingId })
      .populate("createdBy", "role name")
      .sort({ createdAt: 1 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
