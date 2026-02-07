import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import styles from "./Login.module.css";

function StudentProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    const runChecks = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

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

        if (json.role === "FACULTY") {
          if (json.profile_completed) {
            navigate("/home");
          } else {
            navigate("/complete-form/faculty");
          }
          return;
        }

        if (json.role !== "STUDENT") {
          navigate("/");
          return;
        }

        if (json.profile_completed) {
          navigate("/home");
          return;
        }

        // ✅ Allowed to fill student form
        setLoading(false);
      } catch {
        navigate("/");
      }
    };

    runChecks();
  }, [navigate]);

  // 🚫 Block render until checks complete
  if (loading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const res = await fetch("http://localhost:5000/api/profile/student", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          register_number: registrationNumber,
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
        <h2>Student Profile</h2>
        <p>Please complete your student details</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            placeholder="Registration Number *"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
          <input
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

export default StudentProfileForm;
