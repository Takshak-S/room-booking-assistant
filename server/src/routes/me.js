import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/me", clerkAuth, async (req, res) => {
  const user = req.dbUser;

  res.json({
    id: user._id,
    role: user.role,
    approved: user.approved,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber || null,
  });
});

export default router;
