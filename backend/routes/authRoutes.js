import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict rate limiter for auth endpoints to prevent brute-force attacks
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/signup', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.put('/reset-password/:resettoken', authRateLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
