import { useNavigate } from "react-router-dom";
import patientImage from "../../assets/patient.svg"; // adjust the path if alias is not set

const PatientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4 mt-16">
      <div className="flex flex-col md:flex-row items-center justify-center max-w-4xl w-full gap-16 py-14">
        {/* Image Section */}
        <div className="flex-1 flex justify-center items-center">
          <img
            src={patientImage}
            alt="Patient Illustration"
            className="max-w-xs w-full h-auto"
          />
        </div>

        {/* Text + Button Section */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h2 className="text-4xl font-extrabold mb-4 text-blue-700">Welcome, Patient!</h2>
          <p className="mb-6 text-gray-600 text-lg max-w-md">
            Manage and book appointments conveniently through your personalized dashboard.
          </p>
          <button
            onClick={() => navigate("/book-appointment")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition font-semibold text-lg"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
