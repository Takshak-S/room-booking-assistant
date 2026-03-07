import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["CLASSROOM", "LABORATORY", "AUDITORIUM", "SPORTS"],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  amenities: {
    type: [String],
    enum: [
      "PROJECTOR",
      "AC",
      "WIFI",
      "WHITEBOARD",
      "SPEAKERS",
      "MICROPHONE",
      "POWER_OUTLETS",
    ],
    default: [],
  },
  available: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: "",
  },

  tags: {
    type: [String],
    enum: [
      "HACKATHON_READY",
      "WORKSHOP_FRIENDLY",
      "LECTURE_SETUP",
      "MEETING_ROOM",
      "SPORTS_EVENT",
      "OVERNIGHT_ACCESS",
      "COLLABORATIVE_SPACE",
    ],
    default: [],
  },
});

export default mongoose.model("Resource", ResourceSchema);
