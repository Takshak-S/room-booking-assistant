import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ResourceList from "../components/ResourceList";
import BookingForm from "../components/BookingForm";
import resources from "../data/resources";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/");
  }, [navigate]);

  const handleBookingConfirmed = (newBooking) => {
    setMyBookings(prev => [...prev, newBooking]);
    setSelectedResource(null);
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

      {/* SECTION 2: BOOKING FORM (Conditional) */}
      {selectedResource && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Book {selectedResource.name}</h2>
          <div className={styles.formWidthLimit}>
            <BookingForm 
              resource={selectedResource} 
              onBookingConfirmed={handleBookingConfirmed} 
            />
          </div>
        </section>
      )}

      {/* SECTION 3: SUMMARY */}
      {myBookings.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Your Recent Bookings</h2>
          <div className={styles.resourceGrid}>
            {myBookings.map(b => (
              <div key={b.id} className={styles.card}>
                <strong>{b.resourceName}</strong>
                <p style={{color: 'var(--text-muted)'}}>
                  {b.date} | {b.startTime} - {b.endTime}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;