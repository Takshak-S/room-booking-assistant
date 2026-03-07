import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../src/models/resource.model.js";

dotenv.config();

const resources = [
  {
    name: "Sensing and IoT Lab",
    type: "LABORATORY",
    capacity: 40,
    location: "SJT 4th Floor",
    amenities: ["PROJECTOR", "AC", "WIFI", "POWER_OUTLETS"],
    description: "Equipped with latest IoT kits and sensors for research.",
    tags: ["WORKSHOP_FRIENDLY", "COLLABORATIVE_SPACE"],
  },
  {
    name: "Netaji Subhash Chandra Bose Auditorium",
    type: "AUDITORIUM",
    capacity: 250,
    location: "SJT Ground Floor",
    amenities: ["PROJECTOR", "AC", "WIFI", "SPEAKERS", "MICROPHONE"],
    description: "Grand auditorium for seminars and guest lectures.",
    tags: ["LECTURE_SETUP", "WORKSHOP_FRIENDLY"],
  },
  {
    name: "Robotics and Automation Lab",
    type: "LABORATORY",
    capacity: 35,
    location: "TT 2nd Floor",
    amenities: ["PROJECTOR", "AC", "WIFI", "POWER_OUTLETS"],
    description:
      "Advanced robotics lab with robotic arms and automation tools.",
    tags: ["HACKATHON_READY", "COLLABORATIVE_SPACE"],
  },
  {
    name: "Smart Classroom 101",
    type: "CLASSROOM",
    capacity: 60,
    location: "PRP 1st Floor",
    amenities: ["PROJECTOR", "AC", "WIFI", "WHITEBOARD"],
    description: "Modern smart classroom with interactive boards.",
    tags: ["LECTURE_SETUP"],
  },
  {
    name: "Indoor Sports Complex",
    type: "SPORTS",
    capacity: 100,
    location: "Near Men's Hostel",
    amenities: ["WIFI"],
    description: "Facilities for badminton, table tennis, and carrom.",
    tags: ["SPORTS_EVENT"],
  },
  {
    name: "Hackers Den",
    type: "LABORATORY",
    capacity: 50,
    location: "SJT 7th Floor",
    amenities: ["PROJECTOR", "AC", "WIFI", "POWER_OUTLETS"],
    description: "Dedicated space for coding contests and hackathons.",
    tags: ["HACKATHON_READY", "OVERNIGHT_ACCESS", "COLLABORATIVE_SPACE"],
  },
  {
    name: "Discussion Room A",
    type: "CLASSROOM",
    capacity: 15,
    location: "Library 2nd Floor",
    amenities: ["AC", "WIFI", "WHITEBOARD", "POWER_OUTLETS"],
    description: "Small room for group discussions and team meetings.",
    tags: ["MEETING_ROOM", "COLLABORATIVE_SPACE"],
  },
];

async function seedData() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data (optional, but good for consistent seating)
    await Resource.deleteMany({});
    console.log("Cleared existing resources.");

    await Resource.insertMany(resources);
    console.log("Successfully seeded resources!");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
