import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import supabase from "../config/supabase";

function StudentProfileForm() {
  const navigate = useNavigate();
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();
    const token = data.session.access_token;
    const bodyData = {
      name,
      register_number:registrationNumber,
      mobile_number:mobileNumber
    }
    console.log(token);
    // Store basic profile info locally for navbar / UI usage
    const response = await fetch('http://localhost:5000/api/profile/student', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(bodyData)    
            }).then(res=>res.json());
            if (response.success === true) {
              localStorage.setItem(
                "userProfile",
                JSON.stringify({
                  name,
                  role: "STUDENT",
                  registrationNumber,
                  mobileNumber,
                })
              );
              navigate("/home");
            } else {
              navigate("/");
            }
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

