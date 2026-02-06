import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const mockUser = { name: "VIT Student", email: "student@vitstudent.ac.in" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    navigate("/setup-profile");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <h2 style={{marginBottom: '8px'}}>VITMAS Portal</h2>
        <p style={{color: 'var(--text-muted)'}}>Room Booking Assistant</p>
        <div className={styles.form}>
          <button className={styles.googleBtn} onClick={handleLogin}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login;