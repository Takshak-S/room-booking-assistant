import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ResourceList from "../components/ResourceList";
import BookingForm from "../components/BookingForm";
import resources from "../data/resources";
import styles from "./Dashboard.module.css";

function isUpcoming(booking) {
  // Consider a booking editable/cancellable if its start time is in the future
  const start = new Date(`${booking.date}T${booking.startTime}:00`);
  return start.getTime() > Date.now();
}

function Dashboard() {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    // Require a completed profile (stored after student/faculty forms)
    const profile = localStorage.getItem("userProfile");
    if (!profile) navigate("/");
  }, [navigate]);

  const handleBookingConfirmed = (newBooking) => {
    setMyBookings((prev) => {
      if (editingBooking) {
        return prev.map((b) => (b.id === editingBooking.id ? newBooking : b));
      }
      return [...prev, newBooking];
    });
    setSelectedResource(null);
    setEditingBooking(null);
  };

  const handleEditBooking = (booking) => {
    const resourceForBooking =
      resources.find((r) => r.name === booking.resourceName) || null;
    setSelectedResource(resourceForBooking);
    setEditingBooking(booking);
  };

  const handleCancelBooking = (bookingId) => {
    setMyBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  return (
    <div className={styles.mainWrapper}>
      <Navbar />
      
      {/* SECTION 1: RESOURCE SELECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Select a Facility</h2>
        <ResourceList 
          resources={resources} 
          onSelect={setSelectedResource} 
          selectedId={selectedResource?.id}
        />
      </section>

      {/* SECTION 2: BOOKING FORM (Modal popup) */}
      {selectedResource && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.sectionHeader}>
                {editingBooking
                  ? `Edit Booking for ${selectedResource.name}`
                  : `Book ${selectedResource.name}`}
              </h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => {
                  setEditingBooking(null);
                  setSelectedResource(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className={styles.formWidthLimit}>
              <BookingForm 
                resource={selectedResource} 
                onBookingConfirmed={handleBookingConfirmed}
                initialBooking={editingBooking}
                onCancelEdit={() => {
                  setEditingBooking(null);
                  setSelectedResource(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SUMMARY */}
      {myBookings.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Your Recent Bookings</h2>
          <div className={styles.resourceGrid}>
            {myBookings.map((b) => {
              const upcoming = isUpcoming(b);
              return (
                <div key={b.id} className={styles.card}>
                  <strong>{b.resourceName}</strong>
                  <p style={{ color: "var(--text-muted)" }}>
                    {b.date} | {b.startTime} - {b.endTime}
                  </p>
                  {upcoming && (
                    <div className={styles.bookingActions}>
                      <button
                        className={styles.bookingActionBtn}
                        onClick={() => handleEditBooking(b)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.bookingActionBtnDanger}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;