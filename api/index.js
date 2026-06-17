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

// ─── MongoDB Connection (serverless-safe, cached across warm invocations) ─────
let mongoConnected = false;

const connectMongo = async () => {
  if (mongoConnected || mongoose.connection.readyState === 1) return;

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Prevent buffering commands when disconnected — fail fast instead
      bufferCommands: false,
    });
    mongoConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    mongoConnected = false;
    console.error('MongoDB connection error:', err.message);
  }
};

// Initiate connection immediately so it's ready for first request
connectMongo();

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

// Trust the Vercel/proxy X-Forwarded-For header for accurate IP-based rate limiting
app.set('trust proxy', 1);

// Helmet — minimal config safe for serverless/Vercel
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS — allow the production frontend and any *.vercel.app domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, same-origin server-side calls)
      if (!origin) return callback(null, true);

      // Allow any *.vercel.app for preview deployments
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In production, log but don't hard-fail CORS — return 403 instead
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Catch malformed JSON bodies and return JSON (not HTML)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }
  next(err);
});

// ─── Health & Root ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'EverActive Physiotherapy API — Operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  // Attempt reconnect on health check if disconnected
  if (mongoose.connection.readyState !== 1) {
    await connectMongo();
  }

  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    success: true,
    message: 'API is operational',
    mongodb: states[mongoose.connection.readyState] ?? 'unknown',
    mongoUriSet: !!process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV || 'not set',
    timestamp: new Date().toISOString(),
  });
});

// ─── DB readiness guard (with auto-retry for cold starts) ────────────────────
app.use('/api', async (req, res, next) => {
  // Skip DB check for health endpoint
  if (req.path === '/health') return next();

  // If not connected, try once more (handles cold-start race condition)
  if (mongoose.connection.readyState !== 1) {
    await connectMongo();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: !process.env.MONGO_URI
        ? 'Database not configured. Set MONGO_URI in Vercel environment variables.'
        : 'Database unavailable. Please try again in a moment.',
    });
  }

  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
