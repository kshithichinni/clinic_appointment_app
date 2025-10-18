import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import Doctor from "../models/Doctor";

// ✅ Book Appointment (with real-time validation)
export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, appointmentDateTime, reason } = req.body;

    if (!doctorId || !appointmentDateTime || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const now = new Date();
    const selectedTime = new Date(appointmentDateTime);
    if (selectedTime <= now) {
      return res.status(400).json({ message: "Appointment time must be in the future" });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user._id,
      appointmentDateTime,
      reason,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Error booking appointment" });
  }
};

// ✅ Get Appointments by Patient — with deep doctor → user population
export const getAppointmentsByPatient = async (req: Request, res: Response) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Error fetching patient appointments" });
  }
};

// ✅ Get Appointments by Doctor (excluding cancelled ones)
export const getAppointmentsByDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $ne: "cancelled" }, // ❌ exclude cancelled
    }).populate("patientId", "name");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Error fetching doctor appointments" });
  }
};

// ✅ Update Appointment Status (doctor can confirm or cancel)
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate("patientId", "name");

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};
