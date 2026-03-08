import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { useAppAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Home,
  LogOut,
  History as HistoryIcon,
  User,
  X,
  Loader2,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { profile, clearProfile } = useAppAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  function isUpcoming(endTime) {
    return new Date(endTime) > new Date();
  }

  async function cancelBooking(id) {
    const token = await getToken();
    await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadHistory();
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`${API_BASE}/api/bookings/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory(await res.json());
      else setHistory([]);
    } catch {
      setHistory([]);
    }
    setHistoryLoading(false);
  }

  const handleLogout = async () => {
    clearProfile();
    await signOut();
    navigate("/");
  };

  const role = profile?.role ?? "—";
  const name = profile?.name ?? "?";
  const firstLetter = name ? name[0].toUpperCase() : "?";
  const temp = name.split(" ");
  const header_display_name =
    temp.length > 1 ? temp.slice(0, temp.length - 1).join(" ") : name;
  return (
    <>
      {/* ---- TOP BAR ---- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Left: user info */}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-zinc-700 text-xs font-semibold uppercase tracking-wider"
            >
              {role}
            </Badge>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {header_display_name}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate("/home")}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-foreground transition-colors hover:bg-zinc-700"
              >
                {firstLetter}
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-zinc-800 bg-zinc-950 p-2 shadow-xl">
                    <div className="mb-2 space-y-0.5 border-b border-zinc-800 px-2 pb-2">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                      {profile?.mobileNumber && (
                        <p className="text-xs text-muted-foreground">
                          {profile.mobileNumber}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowHistory(true);
                        setIsDropdownOpen(false);
                        loadHistory();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-zinc-800 hover:text-foreground"
                    >
                      <HistoryIcon className="h-4 w-4" />
                      Booking History
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-400 transition-colors hover:bg-zinc-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ---- BOOKING HISTORY DIALOG ---- */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>My Booking History</DialogTitle>
          </DialogHeader>

          {historyLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No bookings yet.
            </p>
          )}

          {!historyLoading && history.length > 0 && (
            <div className="space-y-3">
              {history.map((b) => {
                const upcoming = isUpcoming(b.endTime);
                return (
                  <div
                    key={b._id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {b.resourceId?.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={upcoming ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {upcoming ? "Upcoming" : "Past"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            b.status === "APPROVED"
                              ? "border-emerald-800 text-emerald-400"
                              : b.status === "PENDING"
                                ? "border-amber-800 text-amber-400"
                                : b.status === "REJECTED"
                                  ? "border-red-800 text-red-400"
                                  : b.status === "OVERRIDE_PENDING"
                                    ? "border-purple-800 text-purple-400"
                                    : "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {b.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {new Date(b.startTime).toLocaleString()} –{" "}
                      {new Date(b.endTime).toLocaleTimeString()}
                    </p>

                    {upcoming && b.status === "PENDING" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            navigate("/dashboard", {
                              state: { editBooking: b },
                            });
                            setShowHistory(false);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => cancelBooking(b._id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Navbar;
