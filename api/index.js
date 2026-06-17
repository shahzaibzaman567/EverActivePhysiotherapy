import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler, notFound } from '../backend/middleware/errorMiddleware.js';

// Route imports
import authRoutes from '../backend/routes/authRoutes.js';
import doctorRoutes from '../backend/routes/doctorRoutes.js';
import appointmentRoutes from '../backend/routes/appointmentRoutes.js';
import reviewRoutes from '../backend/routes/reviewRoutes.js';
import adminRoutes from '../backend/routes/adminRoutes.js';
import aiRoutes from '../backend/routes/aiRoutes.js';
import contactRoutes from '../backend/routes/contactRoutes.js';

// Load environment variables
dotenv.config();

// Cached MongoDB connection for serverless functions
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/everactive_physio', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for Vercel compatibility
}));

// CORS config for Vercel deployment
// Support development, localhost, and any Vercel deployment URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.FRONTEND_URL,
  // Allow any vercel.app domain for this project
  /https:\/\/.*\.vercel\.app$/,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      // Check if origin matches any allowed origin (string or regex)
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return origin === allowedOrigin;
      });
      
      if (!isAllowed) {
        const msg = `CORS policy does not allow access from origin: ${origin}`;
        console.warn(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to EverActive Physiotherapy Clinic API Gateway',
    status: 'Operational',
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);

// Fallbacks & Error Handlers
app.use(notFound);
app.use(errorHandler);

// Vercel serverless function handler
export default async (req, res) => {
  try {
    // Connect to MongoDB before handling request
    await connectDB();
    
    // Properly invoke Express app with middleware chain
    // This ensures all middleware (CORS, bodyParser, error handlers) are executed
    return new Promise((resolve, reject) => {
      app.handle(req, res, (err) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: err.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
          }));
        }
        resolve();
      });
    });
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to connect to database or process request',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }));
  }
};
