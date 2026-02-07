import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./auth/AuthCallback";
import Home from "./pages/Home";
import StudentProfileForm from "./pages/StudentProfileForm";
import FacultyProfileForm from "./pages/FacultyProfileForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/complete-form/student" element={<StudentProfileForm />} />
        <Route path="/complete-form/faculty" element={<FacultyProfileForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;