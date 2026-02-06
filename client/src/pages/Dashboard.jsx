import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ResourceList from "../components/ResourceList";
import BookingForm from "../components/BookingForm";
import resources from "../data/resources";

function Dashboard() {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const profile = localStorage.getItem("userProfile");

    if (!user || !profile) {
      navigate("/");
    }
  }, [navigate]);

  function handleSelect(resource) {
    setSelectedResource(resource);
  }

  function handleBookingConfirmed(booking) {
    setMyBookings((prev) => [...prev, booking]);
  }

  return (
    <div>
      <Navbar />

      <h2>Dashboard</h2>

      <h3>Select a Resource</h3>
      <ResourceList
        resources={resources}
        onSelect={handleSelect}
      />

      {selectedResource && (
        <>
        <h3>Booking Details</h3>
        <BookingForm
          resource={selectedResource}
          onBookingConfirmed={handleBookingConfirmed}
        />
        </>
      )}

      {myBookings.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>My Bookings</h3>

          {myBookings.map((b) => (
            <div
              key={b.id}
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                marginBottom: "6px",
              }}
            >
              <p>
                <strong>{b.resourceName}</strong>
              </p>
              <p>
                {b.date} | {b.startTime} – {b.endTime}
              </p>
            </div>
          ))}
        </div>

      )}
    </div>
  );
}

export default Dashboard;
