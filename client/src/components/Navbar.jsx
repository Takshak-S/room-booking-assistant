import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const profile = JSON.parse(
    localStorage.getItem("userProfile")
  );

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div>
      <div>
        <strong>{profile.role.toUpperCase()}</strong> |{" "}
        {profile.department}
      </div>

      <div>
        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        {profile.role === "faculty" && (
          <button>Approve Requests</button>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
