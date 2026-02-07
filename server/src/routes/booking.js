import express from "express";
import supabase from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import multer from "multer";

/*
Club booking request body:
    {
  "acting_as_type": "CLUB",
  "club_id": "uuid",
  "resource_id": "uuid",
  "start_time": "2026-03-12T10:00:00",
  "end_time": "2026-03-12T13:00:00",
  "purpose": "Robotics workshop"
}

Faculty booking request body:
{
  "acting_as_type": "FACULTY",
  "resource_id": "uuid",
  "start_time": "2026-03-10T14:00:00",
  "end_time": "2026-03-10T17:00:00",
  "purpose": "Extra DBMS class"
}

*/

/*
response:
{
  "success": true,
  "booking_id": "...",
  "status": "PENDING_APPROVAL"
}
*/

const router = express.Router();
const upload = multer();
router.post(
  "/bookings",
  requireAuth,
  upload.single("document"),
  async (req, res) => {
    const userId = req.user.id;

    const { resource_id, start_time, end_time, purpose } = req.body;
    const file = req.file;
    console.log(file);
    console.log(req.body);
    /* ---------- BASIC VALIDATION ---------- */
    if (!resource_id || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({ error: "Invalid time range" });
    }

    /* ---------- GET USER ROLE (/api/me SOURCE) ---------- */
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userErr || !user) {
      return res.status(401).json({ error: "User not found" });
    }

    let acting_as_type;
    let acting_as_id;

    /* ---------- FACULTY FLOW ---------- */
    if (user.role === "FACULTY") {
      acting_as_type = "FACULTY";
      acting_as_id = userId;
    }

    /* ---------- STUDENT → CLUB FLOW ---------- */
    if (user.role === "STUDENT") {
      const { data: clubMember } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("user_id", userId)
        .eq("role", "BOARD")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!clubMember) {
        return res.status(403).json({
          error: "Student is not authorized to book for any club",
        });
      }

      acting_as_type = "CLUB";
      acting_as_id = clubMember.club_id;
    }

    /* ---------- CREATE BOOKING ---------- */
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        resource_id,
        created_by_user_id: userId,
        acting_as_type,
        acting_as_id,
        start_time,
        end_time,
        purpose,
        status: "PENDING_APPROVAL",
      })
      .select()
      .single();

    if (bookingError) {
      return res.status(409).json({
        error: "Time slot already booked or pending approval",
      });
    }

    /* ---------- OPTIONAL DOCUMENT UPLOAD ---------- */
    let fileUrl = null;

    if (file) {
      const filePath = `${booking.id}/${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("booking-documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        // rollback booking if document upload fails
        await supabase.from("bookings").delete().eq("id", booking.id);
        return res.status(500).json({ error: "Document upload failed" });
      }

      fileUrl = `booking-documents/${filePath}`;

      await supabase.from("booking_documents").insert({
        booking_id: booking.id,
        file_url: fileUrl,
        uploaded_by: userId,
      });
    }

    /* ---------- BOOKING EVENT (AUDIT) ---------- */
    await supabase.from("booking_events").insert({
      booking_id: booking.id,
      event_type: "SUBMITTED",
      created_by: userId,
      metadata: {
        acting_as_type,
        acting_as_id,
        has_document: Boolean(file),
      },
    });

    /* ---------- RESPONSE ---------- */
    res.json({
      success: true,
      booking_id: booking.id,
      status: booking.status,
    });
  },
);

export default router;
