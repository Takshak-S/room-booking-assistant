import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import {
  Home,
  LogOut,
  History as HistoryIcon,
  User,
  X,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAppAuth } from "../context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider"
            >
              {role}
            </Badge>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {header_display_name}
            </span>
          </div>

          {}
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

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>

            {}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 border border-border"
              >
                {firstLetter}
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border bg-card p-2 shadow-xl">
                    <div className="mb-2 space-y-0.5 border-b px-2 pb-2">
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
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <HistoryIcon className="h-4 w-4" />
                      Booking History
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
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

      {}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
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
                    className="rounded-lg border bg-card p-3 space-y-2"
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
