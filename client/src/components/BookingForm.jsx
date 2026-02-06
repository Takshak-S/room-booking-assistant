import { useState, useEffect } from "react";
import styles from "./BookingForm.module.css";
import bookingsData from "../data/bookings";

function BookingForm({ resource, onBookingConfirmed }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setStatus(null);
    setDate(""); setStartTime(""); setEndTime("");
  }, [resource]);

  const handleCheck = (e) => {
    e.preventDefault();
    const requested = { start: startTime, end: endTime };
    const conflict = bookingsData.find((b) => 
      b.resourceId === resource.id && 
      b.date === date && 
      (requested.start < b.endTime && requested.end > b.startTime)
    );
    setStatus(conflict ? "conflict" : "available");
  };

  return (
    <div className={styles.bookingForm}>
      <form onSubmit={handleCheck}>
        <div className={styles.dateTimeRow}>
          {/* Added Labels for each input */}
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
        
        <button type="submit" className={styles.submitBtn}>
          Check Availability
        </button>
      </form>

      {status === "conflict" && <p className={styles.error}>❌ This slot is already booked.</p>}
      
      {status === "available" && (
        <div className={styles.success}>
          <p>✅ Room is free!</p>
          <button 
            className={styles.confirmBtn}
            onClick={() => onBookingConfirmed({
              id: Date.now(),
              resourceName: resource.name,
              date, startTime, endTime
            })}
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingForm;