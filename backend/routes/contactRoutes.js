import express from 'express';
import rateLimit from 'express-rate-limit';
import { sendContactMessage } from '../controllers/contactController.js';

const router = express.Router();

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactRateLimiter, sendContactMessage);

export default router;
