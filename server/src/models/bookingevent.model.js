import mongoose from "mongoose";

const BookingEventSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },

  eventType: {
    type: String,
    enum: [
      "CREATED",
      "APPROVED",
      "REJECTED",
      "CANCELLED",
      "CHECKIN",
      "NO_SHOW",
    ],
    required: true,
  },

  metadata: mongoose.Schema.Types.Mixed,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("BookingEvent", BookingEventSchema);
