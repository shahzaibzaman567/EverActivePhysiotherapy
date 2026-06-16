import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  slots: {
    type: [String], // Array of slots in 24h format, e.g., ["09:00", "10:00", "11:30", "14:00"]
    required: true,
    default: [],
  },
});

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional if doctor is profile-only, but recommended for Doctor role
    },
    name: {
      type: String,
      required: [true, 'Please add a doctor name'],
      trim: true,
    },
    image: {
      type: String,
      default: '/images/default-doctor.jpg', // Client fallback
    },
    experience: {
      type: Number,
      required: [true, 'Please specify experience in years'],
    },
    specialty: {
      type: String,
      required: [true, 'Please add a specialty'],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    availability: [availabilitySchema],
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
