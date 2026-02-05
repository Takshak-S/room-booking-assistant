import { useNavigate } from "react-router-dom";

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
    <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <span>
        <strong>{profile.role.toUpperCase()}</strong> |{" "}
        {profile.department}
      </span>

      <span style={{ float: "right" }}>
        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        {profile.role === "faculty" && (
          <button>Approve Requests</button>
        )}

        <button onClick={handleLogout}>Logout</button>
      </span>
    </div>
  );
}

export default Navbar;
