import { useState, useEffect } from "react";
import styles from "./BookingForm.module.css";
import bookingsData from "../data/bookings";

function BookingForm({ resource, onBookingConfirmed }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null);

  // Reset form if the user picks a different room
  useEffect(() => {
    setStatus(null);
    setDate(""); setStartTime(""); setEndTime("");
  }, [resource]);

  const checkOverlap = (existing, requested) => {
    return requested.start < existing.end && requested.end > existing.start;
  };

  const handleCheck = (e) => {
    e.preventDefault();
    const requested = { start: startTime, end: endTime };

    const conflict = bookingsData.find((b) => 
      b.resourceId === resource.id && 
      b.date === date && 
      checkOverlap({ start: b.startTime, end: b.endTime }, requested)
    );

    setStatus(conflict ? "conflict" : "available");
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleCheck}>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </div>
        <button type="submit" style={{width: '100%', marginTop: '10px'}}>Check Availability</button>
      </form>

      {status === "conflict" && <p className={styles.error}>❌ This slot is already booked.</p>}
      {status === "available" && (
        <div className={styles.success}>
          <p>✅ Room is free!</p>
          <button onClick={() => onBookingConfirmed({
            id: Date.now(),
            resourceName: resource.name,
            date, startTime, endTime
          })}>Confirm Booking</button>
        </div>
      )}
    </div>
  );
}

export default BookingForm;