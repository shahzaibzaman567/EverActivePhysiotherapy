import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  setAvailability,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router.route('/:id')
  .get(getDoctorById)
  .put(protect, authorize('admin'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);

router.put('/:id/availability', protect, authorize('admin'), setAvailability);

export default router;
