import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import DoctorCalendar from "../pages/doctor/DoctorCalendar";
import EditProfile from "../pages/EditProfile"; // ✅ NEW

import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case "admin":
      case "doctor":
      case "patient":
        return "/dashboard";
      default:
        return "/";
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={getDashboardPath()} replace />}
      />

      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to={getDashboardPath()} replace />}
      />

      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/book-appointment"
        element={
          user?.role === "patient" ? <BookAppointment /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/my-appointments"
        element={
          user?.role === "patient" ? <MyAppointments /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/admin"
        element={
          user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/doctor-calendar"
        element={
          user?.role === "doctor" ? <DoctorCalendar /> : <Navigate to="/login" replace />
        }
      />

      {/* ✅ Edit Profile route - accessible to all logged-in roles */}
      <Route
        path="/edit-profile"
        element={
          user ? <EditProfile /> : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
