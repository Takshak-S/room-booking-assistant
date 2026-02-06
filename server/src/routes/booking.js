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
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/bookings",
  requireAuth,
  upload.single("document"),
  async (req, res) => {
    const userId = req.user.id;

    const {
      acting_as_type,
      club_id,
      resource_id,
      start_time,
      end_time,
      purpose,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Event proof document required" });
    }

    if (!acting_as_type || !resource_id || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({ error: "Invalid time range" });
    }

    /* ---------- VERIFY USER ROLE ---------- */
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    let actingAsId;

    /* ---------- FACULTY BOOKING ---------- */
    if (acting_as_type === "FACULTY") {
      if (user.role !== "FACULTY") {
        return res.status(403).json({ error: "Not a faculty account" });
      }
      actingAsId = userId;
    } else if (acting_as_type === "CLUB") {
      /* ---------- CLUB BOOKING ---------- */
      if (!club_id) {
        return res.status(400).json({ error: "club_id required" });
      }

      const { data: membership } = await supabase
        .from("club_members")
        .select("id")
        .eq("user_id", userId)
        .eq("club_id", club_id)
        .eq("role", "BOARD")
        .eq("is_active", true)
        .single();

      if (!membership) {
        return res.status(403).json({
          error: "Not authorized to book for this club",
        });
      }

      actingAsId = club_id;
    } else {
      return res.status(400).json({ error: "Invalid acting_as_type" });
    }

    /* ---------- CREATE BOOKING ---------- */
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        resource_id,
        created_by_user_id: userId,
        acting_as_type,
        acting_as_id: actingAsId,
        start_time,
        end_time,
        purpose,
        status: "PENDING_APPROVAL",
      })
      .select()
      .single();

    if (bookingError) {
      // conflict will be caught here by DB constraint
      return res.status(409).json({
        error: "Time slot already booked or pending approval",
      });
    }

    /* ---------- UPLOAD DOCUMENT ---------- */
    const filePath = `${booking.id}/${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("booking-documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      // clean up booking if file upload fails
      await supabase.from("bookings").delete().eq("id", booking.id);
      return res.status(500).json({ error: "Document upload failed" });
    }

    const fileUrl = `booking-documents/${filePath}`;

    /* ---------- SAVE DOCUMENT RECORD ---------- */
    await supabase.from("booking_documents").insert({
      booking_id: booking.id,
      file_url: fileUrl,
      uploaded_by: userId,
    });

    /* ---------- HISTORY EVENT ---------- */
    await supabase.from("booking_events").insert({
      booking_id: booking.id,
      event_type: "SUBMITTED",
      created_by: userId,
      metadata: {
        acting_as_type,
        acting_as_id,
      },
    });

    res.json({
      success: true,
      booking_id: booking.id,
      status: booking.status,
    });
  },
);

export default router;
