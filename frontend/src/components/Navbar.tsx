import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="w-8 h-8" />
        <Link to="/" className="text-xl font-bold text-blue-700">
          Clinic App
        </Link>
        {user && !loading && (
          <span className="text-base sm:text-lg text-gray-800 font-medium hidden sm:inline">
            👋 Hello, <span className="font-semibold">{user.name}</span>
          </span>
        )}
        {loading && (
          <span className="text-base sm:text-lg text-gray-400 font-medium hidden sm:inline">
            Loading...
          </span>
        )}
      </div>

      {/* Right: Navigation Links */}
      <div className="flex items-center gap-5">
        {!user ? (
          <>
            <Link
              to="/"
              className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="text-[15px] text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-[15px] bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>
            {user.role === "patient" && (
              <Link
                to="/my-appointments"
                className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
              >
                My Appointments
              </Link>
            )}
            {user.role === "doctor" && (
              <Link
                to="/doctor-calendar"
                className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
              >
                My Calendar
              </Link>
            )}
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/edit-profile"
              className="text-[15px] text-gray-700 hover:text-blue-600 font-medium"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-[15px] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
