import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import supabase from "../config/supabase";

function FacultyProfileForm() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        navigate("/");
        return;
      }
      const res = await fetch("http://localhost:5000/api/profile/faculty", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          employee_id: employeeId,
          school,
          mobile_number: mobileNumber,
        }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            name,
            role: "FACULTY",
            employeeId,
            school,
            mobileNumber,
          })
        );
        navigate("/home");
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 style={{ color: "var(--secondary)" }}>Faculty Profile</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Please complete your faculty details
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.inputField}
            name="employeeId"
            placeholder="Employee ID *"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
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
            name="school"
            placeholder="School *"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
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

export default FacultyProfileForm;

