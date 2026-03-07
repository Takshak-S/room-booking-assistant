import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

function BookingForm({
  resource,
  onBookingConfirmed,
  initialBooking = null,
  onCancelEdit,
}) {
  const { getToken } = useAuth();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setStatus(null);
    if (initialBooking) {
      const start = new Date(initialBooking.startTime);
      const end = new Date(initialBooking.endTime);
      setDate(start.toISOString().slice(0, 10));
      setStartTime(start.toTimeString().slice(0, 5));
      setEndTime(end.toTimeString().slice(0, 5));
    } else {
      setDate("");
      setStartTime("");
      setEndTime("");
    }
  }, [resource, initialBooking]);

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
    const token = await getToken();
    try {
      const params = new URLSearchParams({
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTime}:00`,
      });
      const res = await fetch(
        `http://localhost:5000/api/resources/availability?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error();
      const available = await res.json();
      setStatus(
        available.some((r) => r._id === resource._id)
          ? "available"
          : "conflict",
      );
    } catch {
      setStatus("conflict");
    }
  };

  const handleConfirm = async () => {
    setStatus("submitting");
    const token = await getToken();
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: resource._id,
          start_time: `${date}T${startTime}:00`,
          end_time: `${date}T${endTime}:00`,
          purpose: "Event booking",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      onBookingConfirmed(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
      setStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCheck} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="bf-date" className="text-xs">
              Date
            </Label>
            <Input
              id="bf-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bf-start" className="text-xs">
              Start
            </Label>
            <Input
              id="bf-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bf-end" className="text-xs">
              End
            </Label>
            <Input
              id="bf-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={status === "checking"}
          >
            {status === "checking" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Check Availability"
            )}
          </Button>
          {initialBooking && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Status messages */}
      {status === "invalid" && (
        <div className="flex items-center gap-2 rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          End time must be after start time.
        </div>
      )}
      {status === "past" && (
        <div className="flex items-center gap-2 rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Booking must be in the future.
        </div>
      )}
      {status === "conflict" && (
        <div className="flex items-center gap-2 rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-400">
          <XCircle className="h-4 w-4 shrink-0" />
          Slot not available — pick another time.
        </div>
      )}
      {status === "available" && (
        <div className="space-y-3 rounded-md border border-emerald-900 bg-emerald-950/50 p-3">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Slot is available!
          </div>
          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={status === "submitting"}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking…
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default BookingForm;
