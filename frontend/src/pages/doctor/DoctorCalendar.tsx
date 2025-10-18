import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../../context/AuthContext";

const localizer = momentLocalizer(moment);

interface Appointment {
  _id: string;
  appointmentDateTime: string;
  patientId: { name: string };
  reason: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

const CustomEvent = ({ event }: { event: CalendarEvent }) => (
  <span
    title={`${event.title}\n${event.start.toLocaleString()} - ${event.end.toLocaleString()}`}
    className="block px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded shadow-md select-none border border-blue-700"
    style={{ fontWeight: 500, fontSize: "1rem" }}
  >
    {event.title}
  </span>
);

const DoctorCalendar = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          "http://localhost:5000/api/appointments/doctor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        setError("Failed to fetch appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const events: CalendarEvent[] = appointments.map((appt) => ({
    id: appt._id,
    title: `${appt.patientId?.name || "Unknown"} – ${appt.reason}`,
    start: moment(appt.appointmentDateTime).toDate(),
    end: moment(appt.appointmentDateTime).add(30, "minutes").toDate(),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 mt-16">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border border-blue-100 overflow-x-auto">
        <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text tracking-tight">
          My Appointment Calendar
        </h2>
        {loading ? (
          <div className="text-center text-blue-600 font-semibold">
            Loading appointments...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-600 italic">
            No appointments found.
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day", "agenda"]}
            defaultView="week"
            step={30}
            popup
            showMultiDayTimes
            selectable
            style={{ height: 600, minWidth: "100%" }}
            components={{ event: CustomEvent }}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorCalendar;
