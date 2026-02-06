import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function StudentProfileForm() {
  const navigate = useNavigate();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Store basic profile info locally for navbar / UI usage
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        role: "Student",
        registrationNumber,
        name,
        mobileNumber,
      })
    );

    // TODO: Call backend API to mark profile_completed = true for the user

    navigate("/home");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 style={{ color: "var(--secondary)" }}>Student Profile</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Please complete your student details
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.inputField}
            name="registrationNumber"
            placeholder="Registration Number *"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />

          <input
            className={styles.inputField}
            name="name"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className={styles.inputField}
            name="mobileNumber"
            placeholder="Mobile Number *"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />

          <button type="submit" className={styles.submitBtn}>
            Continue to Home
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentProfileForm;

