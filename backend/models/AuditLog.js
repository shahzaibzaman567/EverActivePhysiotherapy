import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Can be null for anonymous actions (like signup, failed login attempts)
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log the creation timestamp
  }
);

// Auto-delete audit logs older than 90 days to conserve space in production
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
