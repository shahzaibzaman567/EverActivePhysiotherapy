import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleAIChat } from '../controllers/aiController.js';

const router = express.Router();

// Rate limiter to prevent Gemini API quota exhaustion
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 chat messages per 15-minute window
  message: {
    success: false,
    message: 'Too many queries to our AI Assistant. Please take a break and try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', aiRateLimiter, handleAIChat);

export default router;
