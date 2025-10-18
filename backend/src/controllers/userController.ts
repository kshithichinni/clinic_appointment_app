import { Request, Response } from "express";
import User from "../models/User";
import Doctor from "../models/Doctor";
import bcrypt from "bcryptjs";

// ✅ GET Logged-in User Profile (with doctor info if role = doctor)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profileData: any = { user };

    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId });
      if (doctor) profileData.doctor = doctor;
    }

    res.status(200).json(profileData);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ✅ UPDATE Logged-in User Profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, password, contactInfo, specialization, experience } = req.body;

    // 🔐 Update password only if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (name) user.name = name;

    await user.save();

    // 👨‍⚕️ If doctor, update doctor profile fields
    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId });

      if (doctor) {
        if (contactInfo !== undefined) doctor.contactInfo = contactInfo;
        if (specialization !== undefined) doctor.specialization = specialization;
        if (experience !== undefined) doctor.experience = experience;
        await doctor.save();
      }
    }

    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ✅ GET /api/users/stats - get count of users by role
export const getUserStats = async (req: Request, res: Response) => {
  try {
    // Count users by role in parallel for performance
    const [totalDoctors, totalPatients, totalAdmins] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "admin" }),
    ]);

    res.status(200).json({ totalDoctors, totalPatients, totalAdmins });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
};

// ✅ NEW: GET /api/patients - get list of patients with basic info (read-only)
export const getPatientsList = async (req: Request, res: Response) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("name email createdAt") // Select only fields safe to share with admin
      .sort({ createdAt: -1 }); // Sort newest first

    res.status(200).json(patients);
  } catch (err) {
    console.error("Error fetching patients list:", err);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};
