import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import styles from "./Login.module.css";

function FacultyProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    const runChecks = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/");
          return;
        }

        const res = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const json = await res.json();

        if (json.role === "STUDENT") {
          if (json.profile_completed) {
            navigate("/home");
          } else {
            navigate("/complete-form/student");
          }
          return;
        }

        if (json.role !== "FACULTY") {
          navigate("/");
          return;
        }

        if (json.profile_completed) {
          navigate("/home");
          return;
        }

        // ✅ Allowed to stay on this page
        setLoading(false);
      } catch {
        navigate("/");
      }
    };

    runChecks();
  }, [navigate]);

  // 🚫 Do not render anything until checks finish
  if (loading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const res = await fetch("http://localhost:5000/api/profile/faculty", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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
        <h2>Faculty Profile</h2>
        <p>Please complete your faculty details</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            placeholder="Employee ID *"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />
          <input
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="School *"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            required
          />
          <input
            placeholder="Mobile Number *"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
          <button type="submit">Continue to Home</button>
        </form>
      </div>
    </div>
  );
}

export default FacultyProfileForm;
