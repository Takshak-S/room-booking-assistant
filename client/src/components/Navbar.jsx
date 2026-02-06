import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("userProfile"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.userInfo}>
        <div className={styles.userContainer}>
          <span className={styles.roleBadge}>{profile?.role?.toUpperCase()}</span>
          <span className={styles.userName}>{profile?.name}</span>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button className={styles.homeBtn} onClick={() => navigate("/dashboard")}>
          Home
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;