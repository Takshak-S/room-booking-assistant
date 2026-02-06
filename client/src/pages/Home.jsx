import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 style={{ color: "var(--secondary)" }}>Welcome to VITMAS Portal</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Your profile is complete. You can now access room booking features.
        </p>
        <div className={styles.form}>
          <button
            className={styles.submitBtn}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

