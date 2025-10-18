import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    userId: {
      _id: string;
      name: string;
    } | null;
    specialization: string;
  } | null;
  appointmentDateTime: string;
  reason: string;
  status: "pending" | "confirmed" | "cancelled";
}

const MyAppointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/appointments/patient", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status: "cancelled" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: "cancelled" } : a))
      );
      toast.success("Appointment cancelled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  // Sort appointments by date descending (recent first)
  const sortedAppointments = [...appointments].sort((a, b) =>
    moment(b.appointmentDateTime).diff(moment(a.appointmentDateTime))
  );

  // Filter and pagination
  const filtered = sortedAppointments.filter((a) =>
    a.doctorId?.userId?.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading)
    return <div className="text-center mt-10 text-gray-600 font-medium">Loading appointments...</div>;

  if (error)
    return (
      <div className="text-center mt-10 text-red-600 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 mt-16">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          My Appointments
        </h2>

        {/* Search with icon */}
        <div className="relative mb-6 max-w-md mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <FiSearch size={20} />
          </span>
          <input
            type="text"
            placeholder="Search by Doctor's Name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Search appointments by doctor's name"
          />
        </div>

        {paginated.length === 0 ? (
          <p className="text-center text-gray-500 italic">No appointments found.</p>
        ) : (
          <ul className="space-y-6">
            {paginated.map((appt) => (
              <li
                key={appt._id}
                className="border p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col gap-2"
              >
                {appt.doctorId && appt.doctorId.userId ? (
                  <>
                    <p className="text-xl font-semibold text-blue-700">
                      Doctor: {appt.doctorId.userId.name}{" "}
                      <span className="text-sm text-gray-500 font-normal">
                        ({appt.doctorId.specialization})
                      </span>
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
                    <p className="mt-2">
                      Status:{" "}
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold uppercase text-xs ${
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

                    {/* Cancel button only for pending */}
                    {appt.status === "pending" && (
                      <button
                        onClick={() => cancelAppointment(appt._id)}
                        className="mt-4 self-start bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
                        aria-label={`Cancel appointment with ${appt.doctorId.userId.name}`}
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-red-500 font-semibold">
                    Doctor information not available.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="flex justify-center mt-10 space-x-3"
            aria-label="Pagination"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  i + 1 === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-current={i + 1 === currentPage ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
