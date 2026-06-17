import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import { isAdminEmail } from './config/admin.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Fix MongoDB Index for free sessions (remove old index)
const fixAppointmentIndex = async () => {
  try {
    console.log('🔧 Checking/Fixing MongoDB Appointment Index...');
    const Appointment = (await import('./models/Appointment.js')).default;
    
    // Drop old index if it exists
    try {
      const indexes = await Appointment.collection.getIndexes();
      console.log('📋 Current indexes:', Object.keys(indexes));
      
      if (indexes['doctor_1_date_1_slot_1']) {
        console.log('🗑️  Dropping index (duplicate checking done at app level)...');
        await Appointment.collection.dropIndex('doctor_1_date_1_slot_1');
        console.log('✅ Old index dropped');
      }
    } catch (dropErr) {
      console.log('ℹ️  No old index to drop or already dropped');
    }
    
    console.log('✅ MongoDB indexes ready for free sessions');
  } catch (error) {
    console.error('⚠️  Index fix warning:', error.message);
    // Don't crash - application-level checks will still work
  }
};

await fixAppointmentIndex();

const app = express();

// Security Middlewares
app.use(helmet());

// CORS config (Allow local development Vite server and optional production Vercel frontend)
const allowedOrigins = [
  'http://localhost:5173', // Local Vite
  'http://localhost:5174', // Local Vite (if 5173 is in use)
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL, // Deployed frontend url
  // Allow any vercel.app domain for this project
  /https:\/\/.*\.vercel\.app$/,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman in development)
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
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bootstrapAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : 'shahzaibzaman465@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) return;

  try {
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'EverActive Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('Admin account created successfully.');
    } else {
      if (!isAdminEmail(admin.email)) {
        admin.email = adminEmail;
      }
      admin.role = 'admin';
      admin.password = adminPassword;
      await admin.save();
      console.log('Admin account is ready.');
    }

  } catch (error) {
    console.error('Admin bootstrap failed:', error.message);
  }
};

bootstrapAdmin();

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

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections safely in production
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
