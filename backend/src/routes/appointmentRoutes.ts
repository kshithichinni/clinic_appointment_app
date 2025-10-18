import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  bookAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  updateAppointmentStatus, // ✅ Imported
} from "../controllers/appointmentController";

const router = express.Router();

router.post("/book", protect, bookAppointment);
router.get("/patient", protect, getAppointmentsByPatient);
router.get("/doctor", protect, getAppointmentsByDoctor);

// ✅ Doctor updates appointment status (confirm or cancel)
router.patch("/:appointmentId/status", protect, updateAppointmentStatus);

export default router;
