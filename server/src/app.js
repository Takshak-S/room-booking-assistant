import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import meRoutes from "./routes/me.js";
import profileRoutes from "./routes/profile.js";
import adminClubsRoutes from "./routes/adminClubs.js";
import bookingRoutes from "./routes/booking.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", meRoutes);
app.use("/api", profileRoutes);
app.use("/api", adminClubsRoutes);
app.use("/api", bookingRoutes);

app.get('/api/test',(req,res)=>{
  res.json({ok:true});
})

app.get("/", (req, res) => {
  res.send("Backend running");
});

export default app;


