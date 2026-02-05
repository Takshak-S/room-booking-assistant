import { useNavigate } from "react-router-dom";

function ProfileSetup() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const role = user.email.includes("faculty")
    ? "faculty"
    : "student";

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const profileData = Object.fromEntries(formData.entries());

    const completeProfile = {
      ...profileData,
      role,
      email: user.email,
    };

    localStorage.setItem(
      "userProfile",
      JSON.stringify(completeProfile)
    );

    navigate("/dashboard");
  }

  return (
    <div>
      <h2>Complete Your Profile</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          defaultValue={user.name}
          readOnly
        />

        {role === "student" && (
          <>
            <input
              name="rollNumber"
              placeholder="Roll Number"
              required
            />
            <input
              name="year"
              placeholder="Year"
              required
            />
            <input
              name="department"
              placeholder="Department"
              required
            />
          </>
        )}

        {role === "faculty" && (
          <>
            <input
              name="employeeId"
              placeholder="Employee ID"
              required
            />
            <input
              name="department"
              placeholder="Department"
              required
            />
          </>
        )}

        <button type="submit">
          Save & Continue
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;
