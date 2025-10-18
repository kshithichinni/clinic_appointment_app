import { useNavigate } from "react-router-dom";
import hospitalImg from "../assets/hospital.svg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-28 flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-12 gap-10">
      {/* Left side - Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={hospitalImg}
          alt="Hospital Illustration"
          className="w-80 md:w-[400px] drop-shadow-lg"
        />
      </div>

      {/* Right side - Text & Buttons */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 leading-tight">
          Welcome to <br /> Clinic Appointment App
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-md">
          Book your appointments easily, manage schedules, and access healthcare seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
