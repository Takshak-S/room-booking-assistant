import express from "express";
import supabase from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

async function isAdmin(userId) {
  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data?.is_admin === true;
}

async function canViewBooking(userId, booking) {
  // Admin can always view
  if (await isAdmin(userId)) return true;

  // Creator can view
  if (booking.created_by_user_id === userId) return true;

  // Club board members can view club bookings
  if (booking.acting_as_type === "CLUB") {
    const { data } = await supabase
      .from("club_members")
      .select("id")
      .eq("user_id", userId)
      .eq("club_id", booking.acting_as_id)
      .eq("role", "BOARD")
      .eq("is_active", true)
      .single();

    if (data) return true;
  }

  return false;
}

router.get("/bookings/:bookingId/history", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;

  // fetch booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, created_by_user_id, acting_as_type, acting_as_id")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  // authorization
  if (!(await canViewBooking(userId, booking))) {
    return res.status(403).json({ error: "Access denied" });
  }

  // fetch history
  const { data: events, error: historyError } = await supabase
    .from("booking_events")
    .select(
      `
        id,
        event_type,
        metadata,
        created_at,
        users ( id, role )
      `,
    )
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (historyError) {
    return res.status(500).json({ error: historyError.message });
  }

  res.json(events);
});

export default router;

/*
[
  {
    "event_type": "SUBMITTED",
    "created_at": "2026-03-01T10:00:00Z",
    "metadata": null,
    "users": { "role": "STUDENT" }
  },
  {
    "event_type": "APPROVED",
    "created_at": "2026-03-02T09:15:00Z",
    "metadata": null,
    "users": { "role": "ADMIN" }
  },
  {
    "event_type": "OVERRIDDEN",
    "created_at": "2026-03-05T14:30:00Z",
    "metadata": {
      "old_resource": "Room A",
      "new_resource": "Auditorium"
    },
    "users": { "role": "ADMIN" }
  }
]

*/
