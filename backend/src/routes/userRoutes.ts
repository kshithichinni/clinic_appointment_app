import express from "express";
import { getUserProfile, updateUserProfile, getUserStats, getPatientsList } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { adminOnly } from "../middleware/adminMiddleware"; // Admin role check middleware

const router = express.Router();

// Protected profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Stats route - admin only
router.get("/stats", protect, adminOnly, getUserStats);

// New: Patients list route - admin only
router.get("/patients", protect, adminOnly, getPatientsList);

export default router;
