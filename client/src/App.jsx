import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { AuthProvider, useAppAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import StudentProfileForm from "./pages/StudentProfileForm";
import FacultyProfileForm from "./pages/FacultyProfileForm";
import WaitingApproval from "./pages/WaitingApproval";
import AdminDashboard from "./pages/AdminDashboard";
import ChatAssistant from "./components/ChatAssistant";

const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      color: "#888",
    }}
  >
    Loading…
  </div>
);

function ProtectedRoute({ children }) {
  const { profile, loading, isSignedIn } = useAppAuth();

  if (loading) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/" replace />;

  if (!profile) return <Navigate to="/" replace />;

  if (profile && !profile.approved)
    return <Navigate to="/waiting-approval" replace />;

  return children;
}

function UserRoute({ children }) {
  const { profile, loading } = useAppAuth();

  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to="/" replace />;
  if (profile.role === "ADMIN") return <Navigate to="/admin" replace />;

  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function AdminRoute({ children }) {
  const { profile, loading } = useAppAuth();

  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to="/" replace />;
  if (profile.role !== "ADMIN") return <Navigate to="/home" replace />;

  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/sso-callback"
        element={<AuthenticateWithRedirectCallback />}
      />
      <Route path="/waiting-approval" element={<WaitingApproval />} />
      <Route
        path="/home"
        element={
          <UserRoute>
            <Home />
          </UserRoute>
        }
      />
      <Route
        path="/complete-form/student"
        element={
          <UserRoute>
            <StudentProfileForm />
          </UserRoute>
        }
      />
      <Route
        path="/complete-form/faculty"
        element={
          <UserRoute>
            <FacultyProfileForm />
          </UserRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <Dashboard />
          </UserRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function ChatAssistantWrapper() {
  const { isSignedIn, profile } = useAppAuth();
  if (!isSignedIn || !profile) return null;
  return <ChatAssistant />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ChatAssistantWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
