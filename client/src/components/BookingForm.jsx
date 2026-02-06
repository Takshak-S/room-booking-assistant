import { useState, useEffect } from "react";
import styles from "./BookingForm.module.css";
import bookingsData from "../data/bookings";

function BookingForm({ resource, onBookingConfirmed, initialBooking = null, onCancelEdit }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null); // "conflict" | "available" | "past"
  const [approvalFile, setApprovalFile] = useState(null);

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

  const handleCheck = (e) => {
    e.preventDefault();

    // Enforce "only future from now" rule
    const now = new Date();
    const selectedStart = new Date(`${date}T${startTime || "00:00"}:00`);

    if (selectedStart.getTime() <= now.getTime()) {
      setStatus("past");
      return;
    }

    const requested = { start: startTime, end: endTime };
    const conflict = bookingsData.find((b) => 
      b.resourceId === resource.id && 
      b.date === date && 
      (requested.start < b.endTime && requested.end > b.startTime)
    );
    setStatus(conflict ? "conflict" : "available");
  };

  const handleConfirm = () => {
    const bookingPayload = initialBooking
      ? {
          ...initialBooking,
          date,
          startTime,
          endTime,
          approvalFileName: approvalFile ? approvalFile.name : initialBooking.approvalFileName || null,
        }
      : {
          id: Date.now(),
          resourceId: resource.id,
          resourceName: resource.name,
          date,
          startTime,
          endTime,
          approvalFileName: approvalFile ? approvalFile.name : null,
        };

    onBookingConfirmed(bookingPayload);
  };

  const isEditing = Boolean(initialBooking);

  return (
    <div className={styles.bookingForm}>
      <form onSubmit={handleCheck}>
        <div className={styles.dateTimeRow}>
          {/* Date / Time */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Start Time</label>
            <input 
              type="time" 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>End Time</label>
            <input 
              type="time" 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)} 
              required 
            />
          </div>
        </div>

        {/* Document upload */}
        <div className={styles.fileUploadRow}>
          <label className={styles.label}>Approval Document (optional)</label>
          <div className={styles.fileInputWrapper}>
            <input
              id="approval-file"
              type="file"
              className={styles.fileInput}
              onChange={(e) => setApprovalFile(e.target.files?.[0] || null)}
            />
          </div>
          {approvalFile && (
            <p className={styles.fileName}>
              Selected: {approvalFile.name}
            </p>
          )}
        </div>
        
        <div className={styles.actionsRow}>
          <button type="submit" className={styles.submitBtn}>
            {isEditing ? "Re-check Availability" : "Check Availability"}
          </button>

          {isEditing && onCancelEdit && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {status === "past" && (
        <p className={styles.error}>
          You can only book rooms for a time later than the current time.
        </p>
      )}

      {status === "conflict" && (
        <p className={styles.error}>❌ This slot is already booked.</p>
      )}
      
      {status === "available" && (
        <div className={styles.success}>
          <p>✅ Room is free!</p>
          <button 
            className={styles.confirmBtn}
            onClick={handleConfirm}
          >
            {isEditing ? "Update Booking" : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingForm;