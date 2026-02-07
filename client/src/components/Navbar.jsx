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
          <button
            className={styles.homeBtn}
            onClick={() => navigate("/home")}
          >
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

                {/* NEW: Booking History */}
                <button
                  className={styles.dropdownActionBtn}
                  onClick={() => {
                    setShowHistory(true);
                    setIsDropdownOpen(false);
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

      {/* BOOKING HISTORY MODAL (UI ONLY) */}
      {showHistory && (
        <div className={styles.historyOverlay}>
          <div className={styles.historyModal}>
            <div className={styles.historyHeader}>
              <h3>Booking History</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.historyList}>
              {/* MOCK DATA — backend later */}
              <div className={styles.historyItem}>
                <strong>Classroom A</strong>
                <p>2024-03-12 | 10:00 – 12:00</p>
                <span className={styles.pastTag}>Past</span>
              </div>

              <div className={styles.historyItem}>
                <strong>Lab 3</strong>
                <p>2024-04-02 | 14:00 – 16:00</p>
                <span className={styles.upcomingTag}>Upcoming</span>
              </div>

              <div className={styles.historyItem}>
                <strong>Seminar Hall</strong>
                <p>2024-04-15 | 09:00 – 11:00</p>
                <span className={styles.upcomingTag}>Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
