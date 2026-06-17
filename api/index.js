import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

import authRoutes from '../backend/routes/authRoutes.js';
import doctorRoutes from '../backend/routes/doctorRoutes.js';
import appointmentRoutes from '../backend/routes/appointmentRoutes.js';
import reviewRoutes from '../backend/routes/reviewRoutes.js';
import adminRoutes from '../backend/routes/adminRoutes.js';
import aiRoutes from '../backend/routes/aiRoutes.js';
import contactRoutes from '../backend/routes/contactRoutes.js';
import { errorHandler, notFound } from '../backend/middleware/errorMiddleware.js';

const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).catch(() => {});
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'EverActive Physiotherapy Clinic API Gateway', status: 'Operational' });
});

app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    success: true,
    message: 'API is operational',
    mongodb: states[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: !MONGO_URI
        ? 'MONGO_URI not configured. Please set it in Vercel environment variables.'
        : 'Database not connected. Please ensure MONGO_URI is correct and MongoDB allows access from Vercel IPs.',
    });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
