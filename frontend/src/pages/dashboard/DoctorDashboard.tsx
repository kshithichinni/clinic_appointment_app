import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import doctorImage from "../../assets/doctorteam.svg";

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
  };
  appointmentDateTime: string;
  reason: string;
  status: "pending" | "confirmed" | "cancelled";
}

const DoctorDashboard = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/appointments/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: "confirmed" | "cancelled"
  ) => {
    setUpdatingId(appointmentId);
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const now = new Date();

  // Group and sort appointments
  const sortedAppointments = [
    // Upcoming pending appointments (future)
    ...appointments
      .filter(
        (appt) =>
          appt.status === "pending" &&
          new Date(appt.appointmentDateTime) >= now
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentDateTime).getTime() -
          new Date(b.appointmentDateTime).getTime()
      ),

    // Past pending appointments (optional, can exclude)
    ...appointments
      .filter(
        (appt) =>
          appt.status === "pending" &&
          new Date(appt.appointmentDateTime) < now
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentDateTime).getTime() -
          new Date(b.appointmentDateTime).getTime()
      ),

    // Confirmed appointments
    ...appointments
      .filter((appt) => appt.status === "confirmed")
      .sort(
        (a, b) =>
          new Date(a.appointmentDateTime).getTime() -
          new Date(b.appointmentDateTime).getTime()
      ),

    // Cancelled appointments
    ...appointments
      .filter((appt) => appt.status === "cancelled")
      .sort(
        (a, b) =>
          new Date(a.appointmentDateTime).getTime() -
          new Date(b.appointmentDateTime).getTime()
      ),
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4 mt-20">
      <div className="flex flex-col md:flex-row items-start justify-center max-w-6xl w-full gap-16 py-14">
        {/* Left: Image */}
        <div className="flex-1 flex justify-center items-center">
          <img
            src={doctorImage}
            alt="Doctor Illustration"
            className="max-w-md w-full h-auto"
          />
        </div>

        {/* Right: Text + Scrollable Appointment List */}
        <div className="flex-1 flex flex-col justify-start items-center md:items-start text-center md:text-left p-6 bg-gray-50 rounded-lg shadow-lg border border-gray-200 max-h-[80vh]">
          {/* Heading and Description */}
          <div className="mb-6 w-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-blue-700">
              Doctor Dashboard
            </h2>
            <p className="text-gray-700 text-lg max-w-md">
              Manage your appointments, view patient details, and stay organized.
            </p>
          </div>

          {/* Scrollable container for appointments */}
          <div className="overflow-y-auto flex-1 w-full mt-4">
            {loading ? (
              <p>Loading appointments...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : sortedAppointments.length === 0 ? (
              <p className="text-gray-600">No appointments found.</p>
            ) : (
              <ul className="space-y-6">
                {sortedAppointments.map((appt) => (
                  <li
                    key={appt._id}
                    className={`border border-gray-200 rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition ${
                      new Date(appt.appointmentDateTime) < now
                        ? "opacity-70" // Gray out past appointments
                        : ""
                    }`}
                  >
                    <p className="text-lg font-semibold text-green-700">
                      Patient: {appt.patientId.name}
                    </p>
                    <p className="text-gray-700">
                      Date & Time:{" "}
                      <span className="font-medium">
                        {moment(appt.appointmentDateTime).format(
                          "MMMM Do YYYY, h:mm A"
                        )}
                      </span>
                    </p>
                    <p className="text-gray-700">Reason: {appt.reason}</p>
                    <p className="mb-3 text-gray-700">
                      Status:{" "}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          appt.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : appt.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </p>
                    {/* Show buttons only if pending AND appointment is upcoming */}
                    {appt.status === "pending" && new Date(appt.appointmentDateTime) >= now && (
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "confirmed")}
                          disabled={updatingId === appt._id}
                          className={`w-28 py-2 rounded-lg font-semibold shadow bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center ${
                            updatingId === appt._id ? "cursor-not-allowed opacity-70" : ""
                          }`}
                        >
                          {updatingId === appt._id && (
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          )}
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "cancelled")}
                          disabled={updatingId === appt._id}
                          className={`w-28 py-2 rounded-lg font-semibold shadow bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center ${
                            updatingId === appt._id ? "cursor-not-allowed opacity-70" : ""
                          }`}
                        >
                          {updatingId === appt._id && (
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          )}
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
