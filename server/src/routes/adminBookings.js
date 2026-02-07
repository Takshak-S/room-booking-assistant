import express from "express";
import supabase from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

/*
[
  {
    "id": "booking-uuid",
    "purpose": "Robotics Workshop",
    "start_time": "...",
    "end_time": "...",
    "resources": {
      "name": "Auditorium A",
      "type": "AUDITORIUM"
    },
    "booking_documents": [
      {
        "id": "doc-uuid",
        "file_url": "booking-documents/booking-uuid/proof.pdf"
      }
    ]
  }
]

*/

router.get("/admin/bookings/pending", requireAuth, async (req, res) => {
  const adminId = req.user.id;

  if (!(await requireAdmin(adminId))) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      purpose,
      start_time,
      end_time,
      acting_as_type,
      acting_as_id,
      resources ( name, type ),
      booking_documents ( id, file_url )
    `,
    )
    .eq("status", "PENDING_APPROVAL")
    .order("created_at", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get(
  "/admin/documents/:documentId/signed-url",
  requireAuth,
  async (req, res) => {
    const adminId = req.user.id;
    const { documentId } = req.params;

    if (!(await requireAdmin(adminId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // get document record
    const { data: doc, error } = await supabase
      .from("booking_documents")
      .select("file_url")
      .eq("id", documentId)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // generate signed URL (5 minutes)
    const { data: signed, error: signError } = await supabase.storage
      .from("booking-documents")
      .createSignedUrl(doc.file_url.replace("booking-documents/", ""), 300);

    if (signError) {
      return res.status(500).json({ error: "Failed to sign URL" });
    }

    res.json({
      signed_url: signed.signedUrl,
      expires_in: 300,
    });
  },
);

router.post(
  "/admin/bookings/:bookingId/approve",
  requireAuth,
  async (req, res) => {
    const adminId = req.user.id;
    const { bookingId } = req.params;

    if (!(await requireAdmin(adminId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // fetch booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "PENDING_APPROVAL") {
      return res.status(409).json({
        error: "Booking is not pending approval",
      });
    }

    // safety: re-check conflicts
    const { data: conflict } = await supabase
      .from("bookings")
      .select("id")
      .eq("resource_id", booking.resource_id)
      .neq("id", booking.id)
      .in("status", ["PENDING_APPROVAL", "APPROVED"])
      .lt("start_time", booking.end_time)
      .gt("end_time", booking.start_time)
      .maybeSingle();

    if (conflict) {
      return res.status(409).json({
        error: "Conflict detected with another booking",
      });
    }

    // approve
    await supabase
      .from("bookings")
      .update({
        status: "APPROVED",
        approved_by: adminId,
        approved_at: new Date(),
      })
      .eq("id", bookingId);

    // history
    await supabase.from("booking_events").insert({
      booking_id: bookingId,
      event_type: "APPROVED",
      created_by: adminId,
    });

    res.json({
      success: true,
      status: "APPROVED",
    });
  },
);

router.post(
  "/admin/bookings/:bookingId/reject",
  requireAuth,
  async (req, res) => {
    const adminId = req.user.id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!(await requireAdmin(adminId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!reason) {
      return res.status(400).json({
        error: "Rejection reason is required",
      });
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("status")
      .eq("id", bookingId)
      .single();

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "PENDING_APPROVAL") {
      return res.status(409).json({
        error: "Booking is not pending approval",
      });
    }

    await supabase
      .from("bookings")
      .update({
        status: "REJECTED",
        rejected_by: adminId,
        rejected_at: new Date(),
        rejection_reason: reason,
      })
      .eq("id", bookingId);

    await supabase.from("booking_events").insert({
      booking_id: bookingId,
      event_type: "REJECTED",
      created_by: adminId,
      metadata: { reason },
    });

    res.json({
      success: true,
      status: "REJECTED",
    });
  },
);

export default router;
