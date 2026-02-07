import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ResourceList from "../components/ResourceList";
import BookingForm from "../components/BookingForm";
import ResourceSearchFilter from "../components/ResourceSearchFilter";
import styles from "./Dashboard.module.css";
import supabase from "../config/supabase";

function Dashboard() {
  const navigate = useNavigate();

  // raw data from backend
  const [allResources, setAllResources] = useState([]);

  // data shown in UI (after search)
  const [resources, setResources] = useState([]);

  const [selectedResource, setSelectedResource] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  const [search, setSearch] = useState("");

  // IMPORTANT: names match backend params
  const [filters, setFilters] = useState({
    type: "",
    min_capacity: "",
    date: "",
    start_time: "",
    end_time: "",
    has_ac: false,
    has_projector: false,
  });

  /* -----------------------------
     FETCH RESOURCES (BACKEND)
  ----------------------------- */
  useEffect(() => {
    fetchResources();
  }, [filters]);

  async function fetchResources() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (!token) {
      navigate("/login");
      return;
    }

    let baseUrl = "http://localhost:5000/api/resources";
    const params = new URLSearchParams();

    // static filters (always apply)
    if (filters.type) params.append("type", filters.type);
    if (filters.min_capacity)
      params.append("min_capacity", filters.min_capacity);
    if (filters.has_ac) params.append("has_ac", "true");
    if (filters.has_projector) params.append("has_projector", "true");

    // time-based availability
    const hasTimeFilter =
      filters.date && filters.start_time && filters.end_time;

    if (hasTimeFilter) {
      params.append("start_time", `${filters.date}T${filters.start_time}:00`);
      params.append("end_time", `${filters.date}T${filters.end_time}:00`);

      baseUrl = `http://localhost:5000/api/resources/availability`;
    }

    const finalUrl = params.toString()
      ? `${baseUrl}?${params.toString()}`
      : baseUrl;

    const res = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch resources");
      return;
    }

    const dataRes = await res.json();
    setAllResources(dataRes);
  }

  /* -----------------------------
     SEARCH FILTER (FRONTEND)
  ----------------------------- */
  useEffect(() => {
    if (!search) {
      setResources(allResources);
    } else {
      setResources(
        allResources.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, allResources]);

  /* -----------------------------
     FILTER CHANGE HANDLER
  ----------------------------- */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className={styles.mainWrapper}>
      <Navbar />

      {/* RESOURCE SELECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Select a Facility</h2>

        <ResourceSearchFilter
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <ResourceList
          resources={resources}
          onSelect={setSelectedResource}
          selectedId={selectedResource?.id}
        />
      </section>

      {/* BOOKING MODAL */}
      {selectedResource && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
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
                initialBooking={editingBooking}
                onBookingConfirmed={() => {
                  setSelectedResource(null);
                  setEditingBooking(null);
                }}
                onCancelEdit={() => {
                  setEditingBooking(null);
                  setSelectedResource(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
