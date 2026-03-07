import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import User from "../models/user.model.js";

const router = express.Router();

/**
 * STUDENT PROFILE COMPLETION
 */
router.post("/profile/student", clerkAuth, async (req, res) => {
  const user = req.dbUser;
  const { name, register_number, mobile_number } = req.body;

  if (!name || !register_number || !mobile_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (user.role !== "STUDENT") {
    return res.status(403).json({ error: "Not a student account" });
  }

  // Update user document directly
  user.name = name;
  user.mobileNumber = mobile_number;
  await user.save();

  return res.json({
    success: true,
    message: "Student profile completed",
  });
});

/**
 * FACULTY PROFILE COMPLETION
 */
router.post("/profile/faculty", clerkAuth, async (req, res) => {
  const user = req.dbUser;
  const { name, employee_id, school, mobile_number } = req.body;

  if (!name || !employee_id || !mobile_number) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  if (user.role !== "FACULTY") {
    return res.status(403).json({ error: "Not a faculty account" });
  }

  // Update user document directly
  user.name = name;
  user.mobileNumber = mobile_number;
  await user.save();

  return res.json({
    success: true,
    message: "Faculty profile completed",
  });
});

router.get("/profile/me", clerkAuth, async (req, res) => {
  const user = req.dbUser;

  return res.json({
    role: user.role,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber || null,
  });
});

export default router;
