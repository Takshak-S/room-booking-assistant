import { useState , useEffect } from "react";
import bookingsData from "../data/bookings";

function BookingForm({ resource, onBookingConfirmed }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null);

  function checkOverlap(existing, requested) {
    return (
      requested.start < existing.end &&
      requested.end > existing.start
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    const requestedSlot = {
      start: startTime,
      end: endTime,
    };

    const conflict = bookingsData.find((b) => {
      return (
        b.resourceId === resource.id &&
        b.date === date &&
        checkOverlap(
          { start: b.startTime, end: b.endTime },
          requestedSlot
        )
      );
    });

    if (conflict) {
      setStatus("conflict");
    } else {
      setStatus("available");
    }
  }

  function handleConfirm() {
    const newBooking = {
      id: Date.now(),
      resourceId: resource.id,
      resourceName: resource.name,
      date,
      startTime,
      endTime,
    };

    onBookingConfirmed(newBooking);

    setStatus(null);
    setDate("");
    setStartTime("");
    setEndTime("");
  }

  useEffect(() => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setStatus(null);
  }, [resource]);


  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Book {resource.name}</h3>

      <form onSubmit={handleSubmit}>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <br />

        <label>
          Start Time:
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>

        <br />

        <label>
          End Time:
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>

        <br />

        <button type="submit">Check Availability</button>
      </form>

      {status === "conflict" && (
        <p style={{ color: "red" }}>
          ❌ Time slot not available
        </p>
      )}

      {status === "available" && (
        <>
          <p style={{ color: "green" }}>
            ✅ Time slot available
          </p>
          <button 
            disabled={status !== "available"} 
            onClick={handleConfirm}
          >
            Confirm Booking
          </button>
        </>
      )}
    </div>
  );
}

export default BookingForm;
