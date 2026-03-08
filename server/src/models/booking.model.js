import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  startTime: {
    type: Date,
    required: true,
  },

  endTime: {
    type: Date,
    required: true,
  },

  purpose: String,

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "OVERRIDE_PENDING"],
    default: "PENDING",
  },

  overrideReason: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  approvedAt: Date,

  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  rejectedAt: Date,

  rejectionReason: String,
});

export default mongoose.model("Booking", BookingSchema);
