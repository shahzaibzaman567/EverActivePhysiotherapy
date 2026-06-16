import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null, // Optional for free sessions
    },
    date: {
      type: String, // Stored as standard 'YYYY-MM-DD' for simple comparison
      default: null, // Optional for free sessions (admin schedules after approval)
    },
    slot: {
      type: String, // e.g., "10:00"
      default: null, // Optional for free sessions
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    appointmentType: {
      type: String,
      enum: ['consultation', 'taster', null],
      default: null, // null = regular appointment, 'consultation' = free 15-min, 'taster' = care home taster
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to synchronize isActive with status
appointmentSchema.pre('save', function (next) {
  if (this.status === 'Cancelled') {
    this.isActive = undefined; // Setting to undefined unsets it in MongoDB, excluding from the unique index
  } else {
    this.isActive = true;
  }
  next();
});

// No unique index on (doctor, date, slot) - duplicate checking handled at application level
// This allows multiple free sessions (with null doctor/date/slot) to coexist

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
