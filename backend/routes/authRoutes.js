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

// Rate limiter for auth endpoints — brute-force protection
// Note: In serverless (Vercel), each instance has its own memory so limits
// are per-instance, not globally enforced. This still provides per-IP protection
// within a single function instance's lifetime.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting if the store errors (prevents 500s in serverless)
  skip: () => false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    });
  },
});

router.post('/signup', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.put('/reset-password/:resettoken', authRateLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
