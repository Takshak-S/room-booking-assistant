import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../src/models/resource.model.js";

dotenv.config();

const types = ["CLASSROOM", "LABORATORY", "AUDITORIUM", "SPORTS"];
const locations = ["SJT", "TT", "PRP", "GDN", "M-Block", "L-Block"];
const allAmenities = [
  "PROJECTOR",
  "AC",
  "WIFI",
  "WHITEBOARD",
  "SPEAKERS",
  "MICROPHONE",
  "POWER_OUTLETS",
];
const allTags = [
  "HACKATHON_READY",
  "WORKSHOP_FRIENDLY",
  "LECTURE_SETUP",
  "MEETING_ROOM",
  "SPORTS_EVENT",
  "OVERNIGHT_ACCESS",
  "COLLABORATIVE_SPACE",
];

function generateResources(count) {
  const generated = [];
  for (let i = 1; i <= count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const floor = Math.floor(Math.random() * 8) + 1;

    let capacity;
    if (type === "AUDITORIUM") capacity = 150 + Math.floor(Math.random() * 200);
    else if (type === "LABORATORY")
      capacity = 30 + Math.floor(Math.random() * 40);
    else if (type === "SPORTS") capacity = 50 + Math.floor(Math.random() * 100);
    else capacity = 20 + Math.floor(Math.random() * 80);

    const name = `${type.charAt(0) + type.slice(1).toLowerCase()} ${100 + i} (${location})`;

    // Pick 3-5 random amenities
    const amenities = allAmenities
      .sort(() => 0.5 - Math.random())
      .slice(0, 3 + Math.floor(Math.random() * 3));

    // Pick 1-2 random tags
    const tags = allTags
      .sort(() => 0.5 - Math.random())
      .slice(0, 1 + Math.floor(Math.random() * 2));

    generated.push({
      name,
      type,
      capacity,
      location: `${location} ${floor}th Floor`,
      amenities,
      description: `A well-equipped ${type.toLowerCase()} located in ${location}.`,
      tags,
      available: true,
    });
  }
  return generated;
}

async function seedData() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding.");

    await Resource.deleteMany({});
    console.log("Cleared existing resources.");

    const resources = generateResources(100);
    await Resource.insertMany(resources);
    console.log(`Successfully seeded ${resources.length} resources!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
