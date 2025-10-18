import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import User from '../models/User';

// ✅ Create Doctor with new User
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, specialization, experience, contactInfo } = req.body;

    if (!name || !email || !password || !specialization || !experience || !contactInfo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
    });

    const newDoctor = await Doctor.create({
      userId: newUser._id,
      specialization,
      experience,
      contactInfo,
    });

    res.status(201).json(newDoctor);
  } catch (err) {
    console.error('Doctor creation failed:', err);
    res.status(400).json({ message: 'Failed to add doctor', error: err });
  }
};

// ✅ Get All Doctors (with optional filters)
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const { specialization, date } = req.query;

    let filter: any = {};
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    let doctors = await Doctor.find(filter).populate("userId", "name");

    // If a date is provided, filter doctors based on available slots
    if (date) {
      const selectedDate = moment(date as string, "YYYY-MM-DD");
      const startOfDay = selectedDate.startOf("day").toDate();
      const endOfDay = selectedDate.endOf("day").toDate();

      const appointments = await Appointment.find({
        appointmentDateTime: { $gte: startOfDay, $lte: endOfDay },
      });

      const bookedDoctorIds = appointments.map(appt => appt.doctorId.toString());

      doctors = doctors.filter(doc => !bookedDoctorIds.includes(doc._id.toString()));
    }

    res.status(200).json(doctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ message: "Error fetching doctors", error: err });
  }
};

// ✅ Get Available Slots for a Doctor on a Date
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required" });
    }

    const selectedDate = moment(date as string, "YYYY-MM-DD");
    if (!selectedDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startHour = 10;
    const endHour = 17;
    const slotDuration = 30;

    const allSlots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        const slot = selectedDate.clone().hour(hour).minute(min).second(0).millisecond(0);
        allSlots.push(slot.toISOString());
      }
    }

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDateTime: {
        $gte: selectedDate.startOf("day").toDate(),
        $lte: selectedDate.endOf("day").toDate(),
      },
    });

    const bookedTimes = bookedAppointments.map((appt) =>
      moment(appt.appointmentDateTime).toISOString()
    );

    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));
    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Error fetching available slots" });
  }
};

// ✅ Update Doctor (Only doctor info, not user)
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const updated = await Doctor.findByIdAndUpdate(doctorId, req.body, {
      new: true,
    }).populate("userId", "name");

    if (!updated) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update doctor", error: err });
  }
};

// ✅ Delete Doctor
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const deleted = await Doctor.findByIdAndDelete(doctorId);

    if (!deleted) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete doctor", error: err });
  }
};
