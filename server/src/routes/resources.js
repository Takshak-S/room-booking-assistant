import express from "express";
import supabase from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/resources", requireAuth, async (req, res) => {
  const { type, min_capacity, has_projector, has_ac } = req.query;

  let query = supabase.from("resources").select("*").eq("is_active", true);

  if (type) query = query.eq("type", type);
  if (min_capacity) query = query.gte("capacity", Number(min_capacity));
  if (has_projector)
    query = query.eq("has_projector", has_projector === "true");
  if (has_ac) query = query.eq("has_ac", has_ac === "true");

  const { data, error } = await query.order("capacity");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get("/resources/:resourceId", requireAuth, async (req, res) => {
  const { resourceId } = req.params;

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Resource not found" });
  }

  res.json(data);
});

router.get("/resources/availability", requireAuth, async (req, res) => {
  const { start_time, end_time, type, min_capacity, has_projector, has_ac } =
    req.query;

  if (!start_time || !end_time) {
    return res.status(400).json({
      error: "start_time and end_time are required",
    });
  }

  // Step 1: filter resources
  let resourceQuery = supabase
    .from("resources")
    .select("*")
    .eq("is_active", true);

  if (type) resourceQuery = resourceQuery.eq("type", type);
  if (min_capacity)
    resourceQuery = resourceQuery.gte("capacity", Number(min_capacity));
  if (has_projector)
    resourceQuery = resourceQuery.eq("has_projector", has_projector === "true");
  if (has_ac) resourceQuery = resourceQuery.eq("has_ac", has_ac === "true");

  const { data: resources, error } = await resourceQuery;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!resources.length) {
    return res.json([]);
  }

  // Step 2: find conflicting bookings
  const resourceIds = resources.map((r) => r.id);

  const { data: conflicts } = await supabase
    .from("bookings")
    .select("resource_id")
    .in("resource_id", resourceIds)
    .in("status", ["PENDING_APPROVAL", "APPROVED"])
    .lt("start_time", end_time)
    .gt("end_time", start_time);

  const blockedIds = new Set((conflicts || []).map((c) => c.resource_id));

  // Step 3: available resources
  const available = resources.filter((r) => !blockedIds.has(r.id));

  res.json(available);
});

router.post("/admin/resources", requireAuth, async (req, res) => {
  const { name, type, capacity, has_projector, has_ac, location } = req.body;

  const { data, error } = await supabase
    .from("resources")
    .insert({
      name,
      type,
      capacity,
      has_projector,
      has_ac,
      location,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;
