import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import meRoutes from "./routes/me.js";
import profileRoutes from "./routes/profile.js";
import adminClubsRoutes from "./routes/adminClubs.js";
import bookingRoutes from "./routes/booking.js";
import adminOverrideRoutes from "./routes/adminOverride.js";
import adminBookingsRoutes from "./routes/adminBookings.js";
import historyRoutes from "./routes/history.js";
import resourceRoutes from "./routes/resources.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", meRoutes);
app.use("/api", profileRoutes);
app.use("/api", adminClubsRoutes);
app.use("/api", bookingRoutes);
app.use("/api", adminOverrideRoutes);
app.use("/api", adminBookingsRoutes);
app.use("/api", historyRoutes);
app.use("/api", resourceRoutes);

app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

export default app;

/*
{
  "new_resource_id": "uuid",
  "new_start_time": "2026-03-15T10:00:00",
  "new_end_time": "2026-03-15T13:00:00",
  "reason": "Increased participants, larger venue required"
}
*/
