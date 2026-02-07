import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import styles from "./Navbar.module.css";

const API_BASE = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  function isUpcoming(endTime) {
    return new Date(endTime) > new Date();
  }

  async function cancelBooking(id) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadHistory(); // refresh
  }

  /* -----------------------------
     LOAD PROFILE (/api/profile/me)
  ----------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
          if (!cancelled) {
            setMe(null);
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`${API_BASE}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (!cancelled) {
            setMe(null);
            setLoading(false);
          }
          return;
        }

        const profile = await res.json();

        if (!cancelled) {
          setMe(profile);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setMe(null);
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -----------------------------
     LOAD BOOKING HISTORY
  ----------------------------- */
  async function loadHistory() {
    setHistoryLoading(true);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    try {
      const res = await fetch(`${API_BASE}/api/bookings/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const bookings = await res.json();
        setHistory(bookings);
        console.log(bookings);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }

    setHistoryLoading(false);
  }

  /* -----------------------------
     LOGOUT
  ----------------------------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMe(null);
    navigate("/");
  };

  const role = me?.role ?? "";
  const name = me?.name ?? "";
  const firstLetter = name ? name[0].toUpperCase() : "?";

  return (
    <>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.userInfo}>
          <div className={styles.userContainer}>
            {loading ? (
              <>
                <span className={styles.roleBadge}>…</span>
                <span className={styles.userName}>…</span>
              </>
            ) : (
              <>
                <span className={styles.roleBadge}>
                  {role ? role.toUpperCase() : "—"}
                </span>
                <span className={styles.userName}>{name || "—"}</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.homeBtn} onClick={() => navigate("/home")}>
            Home
          </button>

          <div className={styles.profileWrapper}>
            <button
              className={styles.profileAvatar}
              onClick={() => setIsDropdownOpen((open) => !open)}
            >
              {firstLetter}
            </button>

            {isDropdownOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileDetails}>
                  <div className={styles.profileName}>{name || "—"}</div>
                  <div className={styles.profileRole}>{role || "—"}</div>

                  {me?.register_number && (
                    <div className={styles.profileMeta}>
                      Reg No: {me.register_number}
                    </div>
                  )}

                  {me?.employee_id && (
                    <div className={styles.profileMeta}>
                      Employee ID: {me.employee_id}
                    </div>
                  )}

                  {me?.school && (
                    <div className={styles.profileMeta}>
                      School: {me.school}
                    </div>
                  )}

                  {me?.mobile_number && (
                    <div className={styles.profileMeta}>
                      Mobile: {me.mobile_number}
                    </div>
                  )}
                </div>

                <button
                  className={styles.dropdownActionBtn}
                  onClick={() => {
                    setShowHistory(true);
                    setIsDropdownOpen(false);
                    loadHistory();
                  }}
                >
                  Booking History
                </button>

                <button
                  className={styles.dropdownLogoutBtn}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BOOKING HISTORY MODAL */}
      {showHistory && (
        <div className={styles.historyOverlay}>
          <div className={styles.historyModal}>
            <div className={styles.historyHeader}>
              <h3>My Booking History</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.historyList}>
              {historyLoading && <p>Loading…</p>}

              {!historyLoading && history.length === 0 && (
                <p>No bookings yet.</p>
              )}

              {!historyLoading &&
                history.map((b) => {
                  const upcoming = isUpcoming(b.end_time);
                  const statusClass =
                    b.status?.toLowerCase() === "approved"
                      ? styles.statusApproved
                      : b.status?.toLowerCase() === "pending"
                        ? styles.statusPending
                        : b.status?.toLowerCase() === "rejected"
                          ? styles.statusRejected
                          : styles.statusTag;

                  return (
                    <div key={b.id} className={styles.historyItem}>
                      <strong>{b.resources?.name}</strong>

                      <p>
                        {new Date(b.start_time).toLocaleString()} –{" "}
                        {new Date(b.end_time).toLocaleTimeString()}
                      </p>

                      <div className={styles.historyTags}>
                        <span
                          className={
                            upcoming ? styles.upcomingTag : styles.pastTag
                          }
                        >
                          {upcoming ? "Upcoming" : "Past"}
                        </span>

                        <span className={statusClass}>{b.status}</span>
                      </div>

                      {/* ACTIONS */}
                      {upcoming && (
                        <div className={styles.historyActions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => {
                              // You already have BookingForm modal in Dashboard
                              navigate(`/edit-booking/${b.id}`);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className={styles.cancelBtn}
                            onClick={() => cancelBooking(b.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
