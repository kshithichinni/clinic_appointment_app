import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getAvailableSlots,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Admin-only routes
router.post('/', protect, authorizeRoles('admin'), createDoctor);
router.put('/:doctorId', protect, authorizeRoles('admin'), updateDoctor);
router.delete('/:doctorId', protect, authorizeRoles('admin'), deleteDoctor);

// Common routes
router.get('/', protect, getAllDoctors);
router.get('/:doctorId/available-slots', protect, getAvailableSlots);

export default router;

