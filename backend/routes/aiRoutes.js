import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleAIChat } from '../controllers/aiController.js';

const router = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many AI chat requests. Please take a break and try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many AI chat requests. Please take a break and try again in 15 minutes.',
    });
  },
});

router.post('/chat', aiRateLimiter, handleAIChat);

export default router;
