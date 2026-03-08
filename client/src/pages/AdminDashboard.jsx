import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useAppAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../components/Navbar";
import {
  CheckCircle2,
  Loader2,
  Users,
  CalendarDays,
  ShieldCheck,
  Building2,
  Inbox,
} from "lucide-react";

const API = "http://localhost:5000/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { profile } = useAppAuth();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingFrom, setBookingFrom] = useState("");
  const [bookingTo, setBookingTo] = useState("");

  const [venueDate, setVenueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [venueBookings, setVenueBookings] = useState([]);
  const [venueLoading, setVenueLoading] = useState(false);

  useEffect(() => {
    if (profile && profile.role !== "ADMIN") navigate("/home");
  }, [profile, navigate]);

  const authFetch = useCallback(
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    [getToken],
  );

  const authPost = useCallback(
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    [getToken],
  );

  const loadPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      setPendingUsers(await authFetch(`${API}/admin/users/pending`));
    } catch {
      setPendingUsers([]);
    }
    setPendingLoading(false);
  }, [authFetch]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const q =
        userRoleFilter && userRoleFilter !== "ALL"
          ? `?role=${userRoleFilter}`
          : "";
      setAllUsers(await authFetch(`${API}/admin/users${q}`));
    } catch {
      setAllUsers([]);
    }
    setUsersLoading(false);
  }, [authFetch, userRoleFilter]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const p = new URLSearchParams();
      if (bookingStatusFilter && bookingStatusFilter !== "ALL")
        p.append("status", bookingStatusFilter);
      if (bookingFrom) p.append("from", bookingFrom);
      if (bookingTo) p.append("to", bookingTo);
      const q = p.toString() ? `?${p}` : "";
      setBookings(await authFetch(`${API}/admin/bookings${q}`));
    } catch {
      setBookings([]);
    }
    setBookingsLoading(false);
  }, [authFetch, bookingStatusFilter, bookingFrom, bookingTo]);

  const loadVenue = useCallback(async () => {
    setVenueLoading(true);
    try {
      setVenueBookings(
        await authFetch(`${API}/admin/bookings/by-date?date=${venueDate}`),
      );
    } catch {
      setVenueBookings([]);
    }
    setVenueLoading(false);
  }, [authFetch, venueDate]);

  const approveUser = async (userId) => {
    try {
      await authPost(`${API}/admin/users/${userId}/approve`);
      loadPending();
      loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/admin/bookings/${bookingId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body:
          action === "reject-override" || action === "reject"
            ? JSON.stringify({ reason: "Rejected by admin" })
            : undefined,
      });
      if (!res.ok) throw new Error();
      loadBookings();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPending();
    loadUsers();
  }, [loadPending, loadUsers]);

  const totalUsers = allUsers.length;
  const approvedCount = allUsers.filter((u) => u.approved).length;
  const pendingCount = pendingUsers.length;

  if (!profile) return null;

  const roleBadge = (role) => {
    const v = {
      ADMIN: "bg-primary/10 text-primary border-primary/20",
      STUDENT: "bg-secondary text-secondary-foreground border-border",
      FACULTY: "bg-accent/10 text-accent border-accent/20",
    };
    return (
      <Badge
        variant="outline"
        className={`text-[10px] uppercase ${v[role] || ""}`}
      >
        {role || "—"}
      </Badge>
    );
  };

  const statusBadge = (s) => {
    const cls = {
      APPROVED: "border-accent/30 bg-accent/5 text-accent",
      PENDING: "border-primary/30 bg-primary/5 text-primary",
      REJECTED: "border-destructive/30 bg-destructive/5 text-destructive",
      CANCELLED: "border-border text-muted-foreground",
      OVERRIDE_PENDING:
        "border-primary/50 bg-primary/10 text-primary animate-pulse",
    };
    return (
      <Badge
        variant="outline"
        className={`text-[10px] uppercase ${cls[s] || "border-border text-muted-foreground"}`}
      >
        {s}
      </Badge>
    );
  };

  const Empty = ({ text }) => (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <Inbox className="h-8 w-8" />
      <span className="text-sm">{text}</span>
    </div>
  );

  const Spin = () => (
    <div className="flex justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-20 pt-24">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>

        <Tabs
          defaultValue="pending"
          onValueChange={(v) => {
            if (v === "pending") loadPending();
            if (v === "users") loadUsers();
            if (v === "bookings") loadBookings();
            if (v === "venue") loadVenue();
          }}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="gap-1.5 text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4 hidden sm:inline" />
              Pending
              {pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-5 px-1.5 text-[10px]"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4 hidden sm:inline" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <CalendarDays className="h-4 w-4 hidden sm:inline" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="venue" className="gap-1.5 text-xs sm:text-sm">
              <Building2 className="h-4 w-4 hidden sm:inline" />
              Venues
            </TabsTrigger>
          </TabsList>

          {}
          <TabsContent value="pending" className="mt-4">
            <Card className="border-border bg-card/60">
              <CardContent className="p-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Users Awaiting Approval
                </h2>
                {pendingLoading && <Spin />}
                {!pendingLoading && pendingUsers.length === 0 && (
                  <Empty text="No pending approvals 🎉" />
                )}
                {!pendingLoading && pendingUsers.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((u) => (
                          <TableRow key={u._id}>
                            <TableCell className="font-medium">
                              {u.name || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {u.email}
                            </TableCell>
                            <TableCell>{roleBadge(u.role)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-accent/50 text-accent hover:bg-accent/10"
                                onClick={() => approveUser(u._id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="users" className="mt-4 space-y-4">
            {}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Total Users",
                  value: totalUsers,
                  color: "text-foreground",
                },
                {
                  label: "Approved",
                  value: approvedCount,
                  color: "text-emerald-400",
                },
                {
                  label: "Pending",
                  value: totalUsers - approvedCount,
                  color: "text-amber-400",
                },
              ].map((s) => (
                <Card key={s.label} className="border-zinc-800 bg-zinc-950/60">
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wider">
                      {s.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border bg-card/60">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">All Users</h2>
                  <Select
                    value={userRoleFilter}
                    onValueChange={setUserRoleFilter}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {usersLoading && <Spin />}
                {!usersLoading && allUsers.length === 0 && (
                  <Empty text="No users found" />
                )}
                {!usersLoading && allUsers.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers.map((u) => (
                          <TableRow key={u._id}>
                            <TableCell className="font-medium">
                              {u.name || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {u.email}
                            </TableCell>
                            <TableCell>{roleBadge(u.role)}</TableCell>
                            <TableCell>
                              {statusBadge(u.approved ? "APPROVED" : "PENDING")}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="bookings" className="mt-4">
            <Card className="border-border bg-card/60">
              <CardContent className="p-4">
                <div className="mb-4 flex flex-wrap items-end gap-3">
                  <h2 className="mr-auto text-lg font-semibold">
                    All Bookings
                  </h2>
                  <Select
                    value={bookingStatusFilter}
                    onValueChange={setBookingStatusFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="OVERRIDE_PENDING">
                        Overrides
                      </SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={bookingFrom}
                    onChange={(e) => setBookingFrom(e.target.value)}
                    className="w-36"
                  />
                  <Input
                    type="date"
                    value={bookingTo}
                    onChange={(e) => setBookingTo(e.target.value)}
                    className="w-36"
                  />
                  <Button size="sm" onClick={loadBookings}>
                    Filter
                  </Button>
                </div>

                {bookingsLoading && <Spin />}
                {!bookingsLoading && bookings.length === 0 && (
                  <Empty text="No bookings found" />
                )}
                {!bookingsLoading && bookings.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venue</TableHead>
                          <TableHead>Booked By</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell className="font-medium">
                              {b.resourceId?.name || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {b.userId?.name || b.userId?.email || "—"}
                            </TableCell>
                            <TableCell>{roleBadge(b.userId?.role)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(b.startTime).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(b.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" – "}
                              {new Date(b.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground">
                              {b.purpose || "—"}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate text-sm text-purple-400/80">
                              {b.overrideReason || "—"}
                            </TableCell>
                            <TableCell>{statusBadge(b.status)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {b.status === "OVERRIDE_PENDING" && (
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 border-accent/50 text-accent hover:bg-accent/10"
                                    onClick={() =>
                                      handleBookingAction(
                                        b._id,
                                        "approve-override",
                                      )
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      handleBookingAction(b._id, "reject")
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {b.status === "PENDING" && (
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 border-emerald-800 text-emerald-400 hover:bg-emerald-950"
                                    onClick={() =>
                                      handleBookingAction(b._id, "approve")
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 border-red-800/50 text-red-500 hover:bg-red-500/10"
                                    onClick={() =>
                                      handleBookingAction(b._id, "reject")
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="venue" className="mt-4">
            <Card className="border-border bg-card/60">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="mr-auto text-lg font-semibold">
                    Venue Occupancy
                  </h2>
                  <Input
                    type="date"
                    value={venueDate}
                    onChange={(e) => setVenueDate(e.target.value)}
                    className="w-40"
                  />
                  <Button size="sm" onClick={loadVenue}>
                    Show
                  </Button>
                </div>

                {venueLoading && <Spin />}
                {!venueLoading && venueBookings.length === 0 && (
                  <Empty text={`No venues occupied on ${venueDate}`} />
                )}
                {!venueLoading && venueBookings.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venue</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Booked By</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venueBookings.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell className="font-medium">
                              {b.resourceId?.name || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {b.resourceId?.type || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(b.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" – "}
                              {new Date(b.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="text-sm">
                              {b.userId?.name || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {b.userId?.email || "—"}
                            </TableCell>
                            <TableCell>{roleBadge(b.userId?.role)}</TableCell>
                            <TableCell>{statusBadge(b.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default AdminDashboard;
