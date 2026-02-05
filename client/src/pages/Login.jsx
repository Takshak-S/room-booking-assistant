import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  function handleGoogleLogin() {
    // Mock Google user data
    const user = {
      name: "Test User",
      email: "student@college.edu",
    };

    // Save user info
    localStorage.setItem("user", JSON.stringify(user));

    // Check if profile exists
    const profile = localStorage.getItem("userProfile");

    if (!profile) {
      navigate("/setup-profile");
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div>
      <h2>Room Booking System</h2>

      <button onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
