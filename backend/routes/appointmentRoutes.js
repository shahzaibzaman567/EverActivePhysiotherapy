import express from 'express';
import {
  getAppointments,
  bookAppointment,
  bookFreeSession,
  updateAppointmentStatus,
  rescheduleAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all appointment routes

router.route('/')
  .get(getAppointments)
  .post(bookAppointment);

router.post('/free-session', bookFreeSession);

router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);

export default router;
