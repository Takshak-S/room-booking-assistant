import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function ProfileSetup() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.email.includes("faculty") ? "Faculty" : "Student";

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    localStorage.setItem("userProfile", JSON.stringify({ ...data, role }));
    navigate("/dashboard");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 style={{color: 'var(--secondary)'}}>Profile Setup</h2>
        <p style={{color: 'var(--text-muted)'}}>Authenticating as <strong>{role}</strong></p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <input 
            className={styles.inputField}
            name={role === "Student" ? "regNo" : "empId"} 
            placeholder={role === "Student" ? "Registration Number" : "Employee ID"} 
            required 
          />
          <input 
            className={styles.inputField}
            name="dept" 
            placeholder="Department / School (e.g., SITE)" 
            required 
          />
          <button type="submit" className={styles.submitBtn}>Access Dashboard</button>
        </form>
      </div>
    </div>
  );
}
export default ProfileSetup;