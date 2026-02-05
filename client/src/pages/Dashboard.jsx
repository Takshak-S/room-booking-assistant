import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const profile = localStorage.getItem("userProfile");

    if (!user || !profile) {
      navigate("/");
    }
  }, [navigate]);

  const profile = JSON.parse(localStorage.getItem("userProfile"));

  return (
    <div>
      <Navbar />

      <h2>Dashboard</h2>

      <p>
        Welcome, <strong>{profile.email}</strong>
      </p>
    </div>
  );
}

export default Dashboard;
