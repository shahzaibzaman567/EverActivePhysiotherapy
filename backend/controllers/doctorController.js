import Doctor from '../models/Doctor.js';
import AuditLog from '../models/AuditLog.js';

// Helper to log audit actions
const logAudit = async (userId, action, details, req) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Public
 */
export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: `Doctor not found with id ${req.params.id}` });
    }
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new doctor profile
 * @route   POST /api/doctors
 * @access  Private/Admin
 */
export const createDoctor = async (req, res, next) => {
  try {
    const { name, image, experience, specialty, bio, availability, user } = req.body;

    const doctor = await Doctor.create({
      name,
      image,
      experience,
      specialty,
      bio,
      availability: availability || [],
      user: user || undefined,
    });

    await logAudit(
      req.user._id,
      'DOCTOR_CREATED',
      `Admin created doctor profile for ${doctor.name} (Specialty: ${doctor.specialty})`,
      req
    );

    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private/Admin
 */
export const updateDoctor = async (req, res, next) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: `Doctor not found with id ${req.params.id}` });
    }

    doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logAudit(
      req.user._id,
      'DOCTOR_UPDATED',
      `Admin updated doctor profile for ${doctor.name}`,
      req
    );

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor profile
 * @route   DELETE /api/doctors/:id
 * @access  Private/Admin
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: `Doctor not found with id ${req.params.id}` });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    await logAudit(
      req.user._id,
      'DOCTOR_DELETED',
      `Admin deleted doctor profile for ${doctor.name}`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set doctor availability schedule
 * @route   PUT /api/doctors/:id/availability
 * @access  Private/Admin
 */
export const setAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: `Doctor not found with id ${req.params.id}` });
    }

    doctor.availability = availability;
    await doctor.save();

    await logAudit(
      req.user._id,
      'DOCTOR_SCHEDULE_UPDATED',
      `Admin updated weekly availability schedule for Dr. ${doctor.name}`,
      req
    );

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};
