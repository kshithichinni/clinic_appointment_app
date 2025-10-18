import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import adminImage from "../../assets/admin.svg";
import { FaUserMd, FaUserInjured, FaUserShield } from "react-icons/fa";
import toast from "react-hot-toast";

interface Doctor {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  specialization: string;
  experience: string;
  contactInfo: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  appointmentSummary?: string; // optional, if your API provides it
}

const AdminDashboard = () => {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [form, setForm] = useState<any>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAdmins: 0,
  });

  // Fetch doctors list
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await axios.get("http://localhost:5000/api/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
      setStats((prev) => ({ ...prev, totalDoctors: res.data.length }));
    } catch (err) {
      toast.error("Failed to fetch doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Fetch patients list
  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
      setStats((prev) => ({ ...prev, totalPatients: res.data.length }));
    } catch (err) {
      toast.error("Failed to fetch patients.");
    } finally {
      setLoadingPatients(false);
    }
  };

  // Fetch stats (total counts)
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch user stats.");
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchStats();
    fetchPatients();
    // eslint-disable-next-line
  }, []);

  // Doctor form handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Doctor form submit - add or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editId) {
        await axios.put(`http://localhost:5000/api/doctors/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Doctor updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/doctors", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Doctor added successfully!");
      }
      setForm({});
      setIsEditMode(false);
      setEditId(null);
      fetchDoctors();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving doctor.");
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setForm({
      specialization: doctor.specialization,
      experience: doctor.experience,
      contactInfo: doctor.contactInfo,
    });
    setEditId(doctor._id);
    setIsEditMode(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Doctor deleted successfully!");
      fetchDoctors();
      fetchStats();
    } catch (err) {
      toast.error("Error deleting doctor.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 mt-16">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <img src={adminImage} alt="Admin Illustration" className="w-56" />
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold text-blue-700 mb-2 tracking-tight">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Manage doctors, view your platform's stats, and see patient info at a glance.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center bg-blue-100 text-blue-800 p-5 rounded-xl shadow hover:scale-105 transition">
            <FaUserMd className="mr-4 text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Total Doctors</h3>
              <p className="text-3xl">{stats.totalDoctors}</p>
            </div>
          </div>
          <div className="flex items-center bg-green-100 text-green-800 p-5 rounded-xl shadow hover:scale-105 transition">
            <FaUserInjured className="mr-4 text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Total Patients</h3>
              <p className="text-3xl">{stats.totalPatients}</p>
            </div>
          </div>
          <div className="flex items-center bg-purple-100 text-purple-800 p-5 rounded-xl shadow hover:scale-105 transition">
            <FaUserShield className="mr-4 text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Total Admins</h3>
              <p className="text-3xl">{stats.totalAdmins}</p>
            </div>
          </div>
        </div>

        {/* Doctor Form */}
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 shadow-inner mb-12">
          <h3 className="text-xl font-bold text-blue-700 mb-5">
            {isEditMode ? "Edit Doctor" : "Add Doctor"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEditMode && (
              <>
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="specialization" className="block mb-1 font-medium text-gray-700">
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={form.specialization || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor="experience" className="block mb-1 font-medium text-gray-700">
                Experience
              </label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={form.experience || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor="contactInfo" className="block mb-1 font-medium text-gray-700">
                Contact Info
              </label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={form.contactInfo || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-8 w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all text-lg font-semibold shadow-sm"
            disabled={loadingDoctors}
          >
            {isEditMode ? "Update Doctor" : "Add Doctor"}
          </button>
        </form>

        {/* Doctors List */}
        <div>
          <h3 className="text-2xl font-bold mb-5 text-blue-700">Doctor List</h3>
          {loadingDoctors ? (
            <p className="text-center">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="text-center text-gray-600">No doctors found.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <li
                  key={doc._id}
                  className="border border-gray-200 p-5 rounded-xl shadow bg-white hover:shadow-lg transition flex flex-col justify-between h-full"
                >
                  <div>
                    <p className="text-xl font-semibold text-green-700 mb-1">
                      {doc.userId.name.startsWith("Dr.")
                        ? doc.userId.name
                        : `Dr. ${doc.userId.name}`}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Specialization:</span> {doc.specialization}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Experience:</span> {doc.experience}
                    </p>
                    <p className="text-gray-800 mb-4">
                      <span className="font-medium">Contact:</span> {doc.contactInfo}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="bg-yellow-500 text-white min-w-[80px] py-1.5 rounded hover:bg-yellow-600 font-medium shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="bg-red-600 text-white min-w-[80px] py-1.5 rounded hover:bg-red-700 font-medium shadow"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Patients List - Read Only */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-5 text-blue-700">Patient List</h3>
          {loadingPatients ? (
            <p className="text-center">Loading patients...</p>
          ) : patients.length === 0 ? (
            <p className="text-center text-gray-600">No patients found.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.map((p) => (
                <li
                  key={p._id}
                  className="border p-5 rounded-xl shadow bg-white flex flex-col justify-between h-full"
                >
                  <div>
                    <h4 className="text-xl font-semibold text-green-700 mb-1">{p.name}</h4>
                    <p className="text-gray-800">
                      <span className="font-medium">Email:</span> {p.email}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Registered:</span>{" "}
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                    {p.appointmentSummary && (
                      <p className="text-gray-800 mt-1">
                        <span className="font-medium">Appointments:</span> {p.appointmentSummary}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
