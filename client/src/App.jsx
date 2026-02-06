import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./auth/AuthCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/setup-profile" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;