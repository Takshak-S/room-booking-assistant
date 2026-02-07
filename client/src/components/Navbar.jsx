import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    navigate("/");
  };

  const firstLetter = "S";

  return (
    <nav className={styles.navbar}>
      <div className={styles.userInfo}>
        <div className={styles.userContainer}>
          <span className={styles.roleBadge}>STUDENT</span>
          <span className={styles.userName}>SHRISH</span>
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
                <div className={styles.profileName}>{profile?.name}</div>
                <div className={styles.profileRole}>
                  {profile?.role}
                </div>
                {profile?.registrationNumber && (
                  <div className={styles.profileMeta}>
                    Reg No: {profile.registrationNumber}
                  </div>
                )}
                {profile?.employeeId && (
                  <div className={styles.profileMeta}>
                    Employee ID: {profile.employeeId}
                  </div>
                )}
                {profile?.school && (
                  <div className={styles.profileMeta}>
                    School: {profile.school}
                  </div>
                )}
                {profile?.mobileNumber && (
                  <div className={styles.profileMeta}>
                    Mobile: {profile.mobileNumber}
                  </div>
                )}
              </div>
              <button className={styles.dropdownLogoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
