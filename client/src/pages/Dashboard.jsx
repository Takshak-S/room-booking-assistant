import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import Navbar from "../components/Navbar";
import ResourceList from "../components/ResourceList";
import BookingForm from "../components/BookingForm";
import ResourceSearchFilter from "../components/ResourceSearchFilter";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  const [allResources, setAllResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    min_capacity: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  async function fetchResources() {
    const token = await getToken();
    if (!token) {
      navigate("/");
      return;
    }

    let baseUrl = "http://localhost:5000/api/resources";
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.min_capacity)
      params.append("min_capacity", filters.min_capacity);

    const hasTime = filters.date && filters.start_time && filters.end_time;
    if (hasTime) {
      params.append("start_time", `${filters.date}T${filters.start_time}:00`);
      params.append("end_time", `${filters.date}T${filters.end_time}:00`);
      baseUrl = "http://localhost:5000/api/resources/availability";
    }

    const url = params.toString() ? `${baseUrl}?${params}` : baseUrl;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setAllResources(data);
  }

  useEffect(() => {
    if (!search) setResources(allResources);
    else
      setResources(
        allResources.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
  }, [search, allResources]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (location.state?.editBooking) {
      const b = location.state.editBooking;
      setSelectedResource(b.resourceId);
      setEditingBooking(b);
      
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-20 pt-24">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Select a Facility
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse available rooms, labs, and venues to make a booking.
          </p>
        </div>

        <ResourceSearchFilter
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <ResourceList
          resources={resources}
          onSelect={setSelectedResource}
          selectedId={selectedResource?._id}
        />
      </main>

      {}
      <Dialog
        open={!!selectedResource}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedResource(null);
            setEditingBooking(null);
          }
        }}
      >
        <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBooking
                ? `Edit Booking — ${selectedResource?.name}`
                : `Book ${selectedResource?.name}`}
            </DialogTitle>
          </DialogHeader>

          {selectedResource && (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
