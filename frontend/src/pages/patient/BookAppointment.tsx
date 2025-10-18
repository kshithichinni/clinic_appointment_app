import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import toast from "react-hot-toast";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import { MdPerson } from "react-icons/md";
import { FiFilter } from "react-icons/fi"; // Import filter icon
import calendarImage from "../../assets/calendar.svg"; // Import SVG as image
import { generateAppointmentPDF } from "../../utils/pdf"; // Import PDF utility

// Validation schema
const schema = yup.object({
  doctorId: yup.string().required("Doctor is required"),
  date: yup.string().required("Date is required"),
  timeSlot: yup.string().required("Time slot is required"),
  reason: yup.string().required("Reason is required"),
});

type FormInputs = yup.InferType<typeof schema>;

interface Doctor {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  avatar?: string;
  specialization?: string;
  experience?: string;
  contactInfo?: string;
  unavailableDates?: string[];
}

const BookAppointment = () => {
  const { token, user } = useAuth(); // Assuming user context provides patient info
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<Doctor | null>(null);
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState<FormInputs | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    resetField,
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch {
        toast.error("Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, [token]);

  // Filtered doctor options for Select
  const doctorOptions = doctors
    .filter(
      (doc) =>
        !specializationFilter ||
        doc.specialization?.toLowerCase().includes(specializationFilter.toLowerCase())
    )
    .map((doc) => ({
      value: doc._id,
      label: doc.userId.name + (doc.specialization ? ` (${doc.specialization})` : ""),
      doctor: doc,
    }));

  const handleDoctorChange = (option: any) => {
    setValue("doctorId", option?.value || "");
    setSelectedDoctorInfo(option?.doctor || null);
    setSelectedDate(null);
    setSlots([]);
    resetField("timeSlot");
  };

  // Fetch available slots upon doctor and date selection
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorInfo || !selectedDate) {
        setSlots([]);
        return;
      }
      try {
        setLoadingSlots(true);
        const isoDate = moment(selectedDate).format("YYYY-MM-DD");
        const res = await axios.get(
          `http://localhost:5000/api/doctors/${selectedDoctorInfo._id}/available-slots?date=${isoDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSlots(res.data.slots);
      } catch {
        toast.error("Error fetching time slots");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    if (selectedDoctorInfo && selectedDate) fetchSlots();
  }, [selectedDoctorInfo, selectedDate, token]);

  const unavailableDates =
    selectedDoctorInfo?.unavailableDates?.map((d) => moment(d).toDate()) || [];

  const handleProceed = (data: FormInputs) => {
    setBookingData(data);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingData) return;
    try {
      await axios.post(
        "http://localhost:5000/api/appointments/book",
        {
          doctorId: bookingData.doctorId,
          appointmentDateTime: bookingData.timeSlot,
          reason: bookingData.reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      toast.success("Appointment booked successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error booking appointment");
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 mt-16">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl flex flex-col md:flex-row">
        {/* Left column: Booking Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-900">Book Appointment</h2>

          {/* Specialization filter */}
          <div className="relative w-full mb-5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <FiFilter size={20} />
            </span>
            <input
              type="text"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              placeholder="Filter by specialization..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-md focus:ring-4 focus:ring-blue-300 focus:outline-none transition"
            />
          </div>

          {/* Doctor Autocomplete */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">Select Doctor</label>
            <Select
              options={doctorOptions}
              onChange={handleDoctorChange}
              placeholder="Choose a doctor..."
              isClearable
              formatOptionLabel={(option) => (
                <div className="flex items-center">
                  <MdPerson className="h-8 w-8 text-blue-600 bg-blue-100 rounded-full mr-3 p-1" />
                  <span>{option.label}</span>
                </div>
              )}
              styles={{
                control: (base) => ({ ...base, minHeight: 48 }),
                option: (base) => ({ ...base, padding: 14 }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: { ...theme.colors, primary: "#2563EB" },
              })}
            />
            <input type="hidden" {...register("doctorId")} />
            {errors.doctorId && <p className="text-red-600 text-sm mt-1">{errors.doctorId.message}</p>}
          </div>

          {/* Doctor Info Card */}
          {selectedDoctorInfo && (
            <div className="flex items-center bg-blue-50 border border-blue-200 p-4 rounded-md text-gray-700 mb-6 gap-4">
              <MdPerson className="h-14 w-14 text-blue-600 bg-blue-100 rounded-full p-3" />
              <div>
                <p className="font-semibold text-lg">Dr. {selectedDoctorInfo.userId.name}</p>
                {selectedDoctorInfo.specialization && (
                  <p className="text-gray-600 text-sm">{selectedDoctorInfo.specialization}</p>
                )}
                {selectedDoctorInfo.experience && (
                  <p className="text-gray-500 text-sm">Experience: {selectedDoctorInfo.experience}</p>
                )}
                {selectedDoctorInfo.contactInfo && (
                  <p className="text-gray-500 text-sm">Contact: {selectedDoctorInfo.contactInfo}</p>
                )}
              </div>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit(handleProceed)} className="space-y-7">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setValue("date", date ? moment(date).format("YYYY-MM-DD") : "");
                }}
                filterDate={(date) =>
                  !unavailableDates.some((unav) => moment(date).isSame(unav, "day"))
                }
                minDate={new Date()}
                placeholderText="Pick a date"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-4 focus:ring-blue-300 focus:outline-none transition"
                calendarClassName="border shadow"
                dateFormat="yyyy-MM-dd"
                disabled={!selectedDoctorInfo}
                showDisabledMonthNavigation
              />
              <input type="hidden" {...register("date")} />
              {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Select Time Slot</label>
              <select
                {...register("timeSlot")}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-4 focus:ring-blue-300 focus:outline-none transition bg-white disabled:bg-gray-100"
                disabled={!selectedDate || loadingSlots || slots.length === 0}
              >
                <option value="">-- Choose Time --</option>
                {loadingSlots ? (
                  <option disabled>Loading available slots...</option>
                ) : slots.length > 0 ? (
                  slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {moment(slot).format("hh:mm A")}
                    </option>
                  ))
                ) : (
                  <option disabled>No available slots</option>
                )}
              </select>
              {errors.timeSlot && <p className="text-red-600 text-sm mt-1">{errors.timeSlot.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Reason</label>
              <textarea
                {...register("reason")}
                rows={4}
                placeholder="Describe your symptoms"
                className="w-full px-4 py-3 border border-gray-300 rounded-md resize-none focus:ring-4 focus:ring-blue-300 focus:outline-none transition"
              />
              {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-1 transition ${
                isSubmitting ? "cursor-not-allowed opacity-75" : ""
              }`}
            >
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </div>

        {/* Right column: Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-blue-50 p-8 rounded-b-xl md:rounded-r-xl md:rounded-bl-none">
          <img src={calendarImage} alt="Calendar Illustration" className="w-64 h-64 object-contain" />
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        ariaHideApp={false}
        className="mx-auto my-24 max-w-md bg-white p-6 rounded-xl shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      >
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Confirm Appointment</h3>
        {bookingData && selectedDoctorInfo && (
          <ul className="mb-6 space-y-2 text-gray-800 text-base">
            <li>
              <strong>Doctor:</strong> Dr. {selectedDoctorInfo.userId.name} ({selectedDoctorInfo.specialization})
            </li>
            <li>
              <strong>Date:</strong> {moment(selectedDate).format("MMMM D, YYYY")}
            </li>
            <li>
              <strong>Time:</strong> {moment(bookingData.timeSlot).format("hh:mm A")}
            </li>
            <li>
              <strong>Reason:</strong> {bookingData.reason}
            </li>
          </ul>
        )}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
          >
            Cancel
          </button>

          {/* Download PDF Button */}
          <button
          type="button" // prevents default form behavior
          onClick={() => {
            if (bookingData && selectedDoctorInfo && user) {
              generateAppointmentPDF({
                doctorName: selectedDoctorInfo.userId.name,
                specialization: selectedDoctorInfo.specialization ?? "N/A",
                dateTime: moment(bookingData.timeSlot).format("MMMM Do YYYY, h:mm A"),
                reason: bookingData.reason,
                patientName: user.name ?? "N/A",
                appointmentId: bookingData.doctorId,
              });
            }
          }}
          className="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700">
            Download Slip
          </button>
          <button
            onClick={handleConfirmBooking}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BookAppointment;
