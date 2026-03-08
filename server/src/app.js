import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

import meRoutes from "./routes/me.js";
import profileRoutes from "./routes/profile.js";
import bookingRoutes from "./routes/booking.js";
import adminOverrideRoutes from "./routes/adminOverride.js";
import adminBookingsRoutes from "./routes/adminBookings.js";
import historyRoutes from "./routes/history.js";
import resourceRoutes from "./routes/resources.js";
import adminUsersRoutes from "./routes/adminUsers.js";
import aiRoutes from "./routes/ai.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api", meRoutes);
app.use("/api", profileRoutes);
app.use("/api", bookingRoutes);
app.use("/api", adminOverrideRoutes);
app.use("/api", adminBookingsRoutes);
app.use("/api", historyRoutes);
app.use("/api", resourceRoutes);
app.use("/api", adminUsersRoutes);
app.use("/api", aiRoutes);

app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

export default app;
