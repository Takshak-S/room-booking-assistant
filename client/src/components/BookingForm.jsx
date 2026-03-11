import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ClockPicker from "./ClockPicker";
import API_BASE_URL from "../lib/config";

function BookingForm({
  resource,
  onBookingConfirmed,
  initialBooking = null,
  onCancelEdit,
}) {
  const { getToken } = useAuth();

  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");

  useEffect(() => {
    setStatus(null);
    if (initialBooking) {
      const start = new Date(initialBooking.startTime);
      const end = new Date(initialBooking.endTime);
      setDate(start);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndTime(end.toTimeString().slice(0, 5));
    } else {
      setDate(null);
      setStartTime("");
      setEndTime("");
    }
  }, [resource, initialBooking]);

  useEffect(() => {
    setStatus(null);
    setOverrideReason("");
  }, [date, startTime, endTime]);

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (!date || !startTime || !endTime) return;

    if (endTime <= startTime) {
      setStatus("invalid");
      return;
    }

    const dateStr = format(date, "yyyy-MM-dd");
    const start = new Date(`${dateStr}T${startTime}:00`);
    if (start <= new Date()) {
      setStatus("past");
      return;
    }

    setStatus("checking");
    const token = await getToken();
    try {
      const params = new URLSearchParams({
        start_time: new Date(`${dateStr}T${startTime}:00`).toISOString(),
        end_time: new Date(`${dateStr}T${endTime}:00`).toISOString(),
      });
      if (initialBooking) {
        params.append("exclude_booking_id", initialBooking._id);
      }
      const res = await fetch(
        `${API_BASE_URL}/api/resources/availability?${params}`,
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

  const handleConfirm = async (isOverride = false) => {
    if (isOverride && !overrideReason.trim()) {
      alert("Please provide a reason for the override request.");
      return;
    }

    setStatus("submitting");
    const token = await getToken();
    const dateStr = format(date, "yyyy-MM-dd");
    try {
      const isEdit = !!initialBooking;
      const url = isEdit
        ? `${API_BASE_URL}/api/bookings/${initialBooking._id}`
        : `${API_BASE_URL}/api/bookings`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: resource._id,
          start_time: new Date(`${dateStr}T${startTime}:00`).toISOString(),
          end_time: new Date(`${dateStr}T${endTime}:00`).toISOString(),
          purpose: "",
          is_override: isOverride,
          override_reason: isOverride ? overrideReason : undefined,
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
    <div className="space-y-6">
      <div className="space-y-4">
        {}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal border-border bg-secondary/50 hover:bg-secondary transition-colors h-10",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(d) => d < new Date().setHours(0, 0, 0, 0)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Start Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-border bg-secondary/50 hover:bg-secondary transition-colors h-10"
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {startTime || "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ClockPicker value={startTime} onChange={setStartTime} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">End Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-border bg-secondary/50 hover:bg-secondary transition-colors h-10"
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {endTime || "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ClockPicker value={endTime} onChange={setEndTime} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCheck}
            className="flex-1 h-10 font-semibold"
            disabled={status === "checking" || !date || !startTime || !endTime}
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
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="h-10"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="min-h-[60px]">
        {status === "invalid" && (
          <div className="flex items-center gap-3 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>End time must be after start time.</p>
          </div>
        )}
        {status === "past" && (
          <div className="flex items-center gap-3 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Booking must be in the future.</p>
          </div>
        )}
        {status === "conflict" && (
          <div className="space-y-4 rounded-lg border border-amber-900 bg-amber-950/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 text-sm text-amber-400">
              <XCircle className="h-5 w-5 shrink-0" />
              <p>
                This slot is already booked. You can request an admin override.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-amber-200/50">
                Reason for Override
              </Label>
              <textarea
                className="w-full rounded-md border bg-secondary/50 p-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Explain why you need this venue..."
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="w-full border-amber-800 text-amber-400 hover:bg-amber-900/20 h-10"
              onClick={() => handleConfirm(true)}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Request Override"
              )}
            </Button>
          </div>
        )}
        {status === "available" && (
          <div className="space-y-4 rounded-lg border border-emerald-900 bg-emerald-950/30 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 text-sm text-emerald-400 font-medium">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              Slot is available!
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
              onClick={() => handleConfirm(false)}
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
    </div>
  );
}

export default BookingForm;
