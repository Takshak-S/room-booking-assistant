import { useState, useEffect } from "react";
import styles from "./BookingForm.module.css";
import  supabase  from "../config/supabase";

function BookingForm({
  resource,
  onBookingConfirmed,
  initialBooking = null,
  onCancelEdit,
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null); // null | past | conflict | available
  const [approvalFile, setApprovalFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(null);
    setApprovalFile(null);

    if (initialBooking) {
      setDate(initialBooking.date);
      setStartTime(initialBooking.startTime);
      setEndTime(initialBooking.endTime);
    } else {
      setDate("");
      setStartTime("");
      setEndTime("");
    }
  }, [resource, initialBooking]);

  /* -----------------------------
     CHECK AVAILABILITY (BACKEND)
  ----------------------------- */
  const handleCheck = async (e) => {
    e.preventDefault();

    const now = new Date();
    const selectedStart = new Date(`${date}T${startTime}:00`);

    if (selectedStart <= now) {
      setStatus("past");
      return;
    }

    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    try {
      const params = new URLSearchParams({
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTime}:00`,
      });

      const res = await fetch(
        `http://localhost:5000/api/resources/availability?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const availableResources = await res.json();

      const isFree = availableResources.some((r) => r.id === resource.id);

      setStatus(isFree ? "available" : "conflict");
    } catch (err) {
      console.error(err);
      setStatus("conflict");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     CONFIRM BOOKING
  ----------------------------- */
  const handleConfirm = async () => {
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    try {
      // 1️⃣ Create booking

      const requestBody = {
        resource_id: resource.id,
        acting_as_type: "CLUB", // or FACULTY (can be dynamic later)
        acting_as_id: null,
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTime}:00`,
        purpose: "Event booking",
      }
      console.log("Request body for booking:", requestBody);
      const bookingRes = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      const bookingData = await bookingRes.json();
      console.log("Booking response:", bookingData);

      if (!bookingRes.ok) {
        throw new Error(bookingData.error || "Booking failed");
      }

      // 2️⃣ Upload document (optional)
      if (approvalFile) {
        const formData = new FormData();
        formData.append("file", approvalFile);

        await fetch(
          `http://localhost:5000/api/bookings/${bookingData.booking_id}/document`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            },
            body: formData,
          },
        );
      }

      onBookingConfirmed(bookingData);
    } catch (err) {
      console.error(err);
      alert("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(initialBooking);

  return (
    <div className={styles.bookingForm}>
      <form onSubmit={handleCheck}>
        <div className={styles.dateTimeRow}>
          <div className={styles.inputGroup}>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* DOCUMENT */}
        <div className={styles.fileUploadRow}>
          <label>Approval Document (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setApprovalFile(e.target.files?.[0] || null)}
          />
          {approvalFile && <p>{approvalFile.name}</p>}
        </div>

        <div className={styles.actionsRow}>
          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Availability"}
          </button>

          {isEditing && onCancelEdit && (
            <button type="button" onClick={onCancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {status === "past" && (
        <p className={styles.error}>You can only book future time slots.</p>
      )}

      {status === "conflict" && (
        <p className={styles.error}>❌ Slot not available</p>
      )}

      {status === "available" && (
        <div className={styles.success}>
          <p>✅ Room is available</p>
          <button onClick={handleConfirm} disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingForm;
