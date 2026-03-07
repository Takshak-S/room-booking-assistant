import express from "express";
import { clerkAuth } from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import Resource from "../models/resource.model.js";
import Booking from "../models/booking.model.js";

const router = express.Router();

/**
 * GET /resources — list resources with optional filters
 */
router.get("/resources", clerkAuth, async (req, res) => {
  const { type, min_capacity } = req.query;

  try {
    const filter = { available: true };

    if (type) filter.type = type;
    if (min_capacity) filter.capacity = { $gte: Number(min_capacity) };

    const resources = await Resource.find(filter).sort({ capacity: 1 });

    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /resources/availability — resources available in a time window
 */
router.get("/resources/availability", clerkAuth, async (req, res) => {
  const { start_time, end_time, type, min_capacity } = req.query;

  if (!start_time || !end_time) {
    return res.status(400).json({
      error: "start_time and end_time are required",
    });
  }

  try {
    const filter = { available: true };

    if (type) filter.type = type;
    if (min_capacity) filter.capacity = { $gte: Number(min_capacity) };

    const resources = await Resource.find(filter);

    if (!resources.length) {
      return res.json([]);
    }

    const resourceIds = resources.map((r) => r._id);

    // Find conflicting bookings
    const conflicts = await Booking.find({
      resourceId: { $in: resourceIds },
      status: { $in: ["PENDING", "APPROVED"] },
      startTime: { $lt: new Date(end_time) },
      endTime: { $gt: new Date(start_time) },
    }).select("resourceId");

    const blockedIds = new Set(conflicts.map((c) => c.resourceId.toString()));

    const available = resources.filter(
      (r) => !blockedIds.has(r._id.toString()),
    );

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /resources/:resourceId — single resource
 */
router.get("/resources/:resourceId", clerkAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/resources — create a resource (admin only)
 */
router.post("/admin/resources", clerkAuth, requireAdmin, async (req, res) => {
  const { name, type, capacity, location, amenities, tags, description } =
    req.body;

  try {
    const resource = await Resource.create({
      name,
      type,
      capacity,
      location,
      amenities,
      tags,
      description,
    });

    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
