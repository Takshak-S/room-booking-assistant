import express from "express";
import { GoogleGenAI } from "@google/genai";
import { clerkAuth } from "../middleware/auth.js";
import Resource from "../models/resource.model.js";
import Booking from "../models/booking.model.js";
import BookingEvent from "../models/bookingevent.model.js";
import mongoose from "mongoose";

const router = express.Router();

// Initialize the 2026 GenAI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the VITMAS Room Booking Assistant. Your goal is to help users find and book rooms for events.
  
Guidelines:
1. Always check for availability BEFORE suggesting or booking a room.
2. Be polite and professional.
3. Suggest the most relevant rooms based on capacity, amenities, and purpose.
4. If a user wants to book, summarize the details (Room, Time, Purpose) and ask for confirmation before calling the create_booking tool.
5. Use the user's name if provided in the context.
6. If no rooms match exactly, suggest the closest alternatives.

Current Time: ${new Date().toLocaleString()}
`;

// AI Tool Definitions (2026 Schema)
const tools = [
  {
    functionDeclarations: [
      {
        name: "search_rooms",
        description:
          "Search for available rooms based on various criteria and time slots.",
        parametersJsonSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["CLASSROOM", "LABORATORY", "AUDITORIUM", "SPORTS"],
              description: "Type of room",
            },
            min_capacity: {
              type: "number",
              description: "Minimum capacity required",
            },
            amenities: {
              type: "array",
              items: { type: "string" },
              description: "Required amenities (e.g., AC, PROJECTOR)",
            },
            start_time: {
              type: "string",
              description: "ISO 8601 string for start time",
            },
            end_time: {
              type: "string",
              description: "ISO 8601 string for end time",
            },
          },
          required: ["start_time", "end_time"],
        },
      },
      {
        name: "create_booking",
        description: "Directly create a booking for a specified room and time.",
        parametersJsonSchema: {
          type: "object",
          properties: {
            resource_id: {
              type: "string",
              description: "ID of the resource to book",
            },
            start_time: {
              type: "string",
              description: "ISO 8601 string for start time",
            },
            end_time: {
              type: "string",
              description: "ISO 8601 string for end time",
            },
            purpose: { type: "string", description: "Purpose of the booking" },
          },
          required: ["resource_id", "start_time", "end_time", "purpose"],
        },
      },
    ],
  },
];

const toolHandlers = {
  search_rooms: async ({
    type,
    min_capacity,
    amenities,
    start_time,
    end_time,
  }) => {
    try {
      const query = { available: true };
      if (type) query.type = type;
      if (min_capacity) query.capacity = { $gte: min_capacity };
      if (amenities && amenities.length > 0)
        query.amenities = { $all: amenities };

      const resources = await Resource.find(query).limit(10).lean();
      const start = new Date(start_time);
      const end = new Date(end_time);

      const availableResources = [];
      for (const res of resources) {
        const conflict = await Booking.findOne({
          resourceId: res._id,
          status: { $in: ["PENDING", "APPROVED"] },
          startTime: { $lt: end },
          endTime: { $gt: start },
        });
        if (!conflict) availableResources.push(res);
      }
      return availableResources;
    } catch (err) {
      return { error: err.message };
    }
  },

  create_booking: async (
    { resource_id, start_time, end_time, purpose },
    req,
  ) => {
    const userId = req.dbUser._id;
    try {
      const session = await mongoose.startSession();
      let result;
      await session.withTransaction(async () => {
        const conflict = await Booking.findOne({
          resourceId: resource_id,
          status: { $in: ["PENDING", "APPROVED"] },
          startTime: { $lt: new Date(end_time) },
          endTime: { $gt: new Date(start_time) },
        }).session(session);

        if (conflict) throw new Error("CONFLICT");

        const booking = await Booking.create(
          [
            {
              resourceId: resource_id,
              userId,
              startTime: new Date(start_time),
              endTime: new Date(end_time),
              purpose,
              status: "PENDING",
            },
          ],
          { session },
        );

        await BookingEvent.create(
          [
            {
              bookingId: booking[0]._id,
              eventType: "CREATED",
              createdBy: userId,
              metadata: { purpose, via: "AI_ASSISTANT" },
            },
          ],
          { session },
        );
        result = booking[0];
      });
      await session.endSession();
      return { success: true, booking: result };
    } catch (err) {
      return { error: err.message };
    }
  },
};

router.post("/chat", clerkAuth, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages are required" });
  }

  try {
    // 2026 Model Selection (Gemini 2.5 Flash Lite - Standard for 2026)
    const modelId = "gemini-2.5-flash-lite";

    // Map history for generateContent
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Ensure history starts with user if non-empty
    if (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

    const lastMessage = messages[messages.length - 1].content;

    let response = await ai.models.generateContent({
      model: modelId,
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [...history, { role: "user", parts: [{ text: lastMessage }] }],
      tools,
    });

    // Handle Tool Loops (Manual implementation for GenAI SDK v1.x)
    let callCount = 0;
    while (
      response.functionCalls &&
      response.functionCalls.length > 0 &&
      callCount < 5
    ) {
      const toolResponses = await Promise.all(
        response.functionCalls.map(async (call) => {
          const handler = toolHandlers[call.name];
          if (handler) {
            const data = await handler(call.args, req);
            return {
              functionResponse: {
                name: call.name,
                response: { content: data },
              },
            };
          }
          return null;
        }),
      );

      // Append to the conversation
      response = await ai.models.generateContent({
        model: modelId,
        systemInstruction: SYSTEM_INSTRUCTION,
        contents: [
          ...history,
          { role: "user", parts: [{ text: lastMessage }] },
          {
            role: "model",
            parts: response.functionCalls.map((c) => ({ functionCall: c })),
          },
          { role: "user", parts: toolResponses.filter(Boolean) },
        ],
        tools,
      });
      callCount++;
    }

    res.json({ content: response.text() });
  } catch (err) {
    console.error("AI Chat Route ERROR:", err);
    if (err.status === 429) {
      return res.status(429).json({
        content:
          "Sorry, I've exceeded my free tier quota for the moment. Please try again in about a minute!",
      });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
