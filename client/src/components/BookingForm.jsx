import { useState, useEffect } from "react";
import styles from "./BookingForm.module.css";
import  supabase from "../config/supabase";

function BookingForm({
  resource,
  onBookingConfirmed,
  initialBooking = null,
  onCancelEdit,
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null);
  // null | checking | past | invalid | conflict | available | submitting
  const [approvalFile, setApprovalFile] = useState(null);

  useEffect(() => {
    setStatus(null);
    setApprovalFile(null);

    if (initialBooking) {
      const start = new Date(initialBooking.start_time);
      const end = new Date(initialBooking.end_time);

      setDate(start.toISOString().slice(0, 10));
      setStartTime(start.toTimeString().slice(0, 5));
      setEndTime(end.toTimeString().slice(0, 5));
    } else {
      setDate("");
      setStartTime("");
      setEndTime("");
    }
  }, [resource, initialBooking]);

  /* -----------------------------
     CHECK AVAILABILITY
  ----------------------------- */
  const handleCheck = async (e) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) return;

    if (endTime <= startTime) {
      setStatus("invalid");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    if (start <= new Date()) {
      setStatus("past");
      return;
    }

    setStatus("checking");

    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    try {
      const params = new URLSearchParams({
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTime}:00`,
      });

      const res = await fetch(
        `http://localhost:5000/api/resources/availability?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Availability check failed");

      const availableResources = await res.json();
      const isFree = availableResources.some(
        (r) => r.id === resource.id
      );

      setStatus(isFree ? "available" : "conflict");
    } catch {
      setStatus("conflict");
    }
  };

  /* -----------------------------
     CONFIRM BOOKING (SINGLE REQUEST)
  ----------------------------- */
  const handleConfirm = async () => {
    setStatus("submitting");

    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    try {
      const formData = new FormData();
      formData.append("resource_id", resource.id);
      formData.append(
        "start_time",
        `${date}T${startTime}:00`
      );
      formData.append(
        "end_time",
        `${date}T${endTime}:00`
      );
      formData.append("purpose", "Event booking");

      if (approvalFile) {
        formData.append("document", approvalFile);
      }

      const res = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const dataRes = await res.json();

      if (!res.ok) {
        throw new Error(dataRes.error || "Booking failed");
      }

      onBookingConfirmed(dataRes);
    } catch (err) {
      console.error(err);
      alert(err.message);
      setStatus(null);
    }
  };

  return (
    <div className={styles.bookingForm}>
      <form onSubmit={handleCheck}>
        {/* DATE & TIME */}
        <div className={styles.dateTimeRow}>
          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Start</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label>End</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* DOCUMENT (OPTIONAL) */}
        <div className={styles.inputGroup}>
          <label>Event Proof (PDF – optional)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setApprovalFile(e.target.files?.[0] || null)
            }
          />
          {approvalFile && (
            <p className={styles.fileName}>
              {approvalFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "checking"}
        >
          {status === "checking"
            ? "Checking…"
            : "Check Availability"}
        </button>

        {initialBooking && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {/* STATUS MESSAGES */}
      {status === "invalid" && (
        <p className={styles.error}>
          End time must be after start time.
        </p>
      )}

      {status === "past" && (
        <p className={styles.error}>
          Booking must be in the future.
        </p>
      )}

      {status === "conflict" && (
        <p className={styles.error}>
          ❌ Slot not available
        </p>
      )}

      {status === "available" && (
        <div className={styles.success}>
          <p>✅ Slot available</p>
          <button onClick={handleConfirm}>
            {status === "submitting"
              ? "Booking…"
              : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingForm;
