import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PatientDashboard from "./dashboard/PatientDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading dashboard...</div>;
  }

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "patient":
      return <PatientDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <div className="p-6 text-xl">Invalid role</div>;
  }
};

export default Dashboard;
