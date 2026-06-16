import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../config/nodemailer.js';

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

// Timezone-safe conversion of YYYY-MM-DD to Day Name (e.g. 'Monday')
const getDayName = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * @desc    Get all appointments (Filtered by role)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAppointments = async (req, res, next) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'doctor') {
      // Find doctor profile linked to this user account
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (doctorProfile) {
        query.doctor = doctorProfile._id;
      } else {
        // If doctor user profile is not linked, return empty
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    const appointments = await Appointment.find(query)
      .populate('user', 'name email phone')
      .populate('doctor', 'name specialty image')
      .sort({ date: 1, slot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, slot, notes, phone } = req.body;
    
    console.log('📅 BOOKING APPOINTMENT REQUEST:');
    console.log('  User ID:', req.user.id);
    console.log('  Doctor ID:', doctorId);
    console.log('  Date:', date);
    console.log('  Slot:', slot);
    console.log('  Timestamp:', new Date().toISOString());

    // Validate request inputs
    if (!doctorId || !date || !slot) {
      console.warn('⚠️  VALIDATION FAILED: Missing required fields');
      return res.status(400).json({ success: false, message: 'Please provide doctor, date, and slot.' });
    }

    // Check if doctor exists
    console.log('🔍 Checking if doctor exists...');
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.error('❌ Doctor not found:', doctorId);
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    console.log('✅ Doctor found:', doctor.name);

    // Verify slot matches doctor's availability schedule
    const dayName = getDayName(date);
    console.log('📍 Day Name:', dayName);
    const daySchedule = doctor.availability.find((sched) => sched.day === dayName);

    if (!daySchedule || !daySchedule.slots.includes(slot)) {
      console.warn('⚠️  SLOT NOT AVAILABLE for', dayName, 'at', slot);
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.name} is not available on ${dayName} at ${slot}.`,
      });
    }
    console.log('✅ Slot is available');

    // Logic-level double booking check
    console.log('🔍 Checking for double bookings...');
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      slot,
      status: { $ne: 'Cancelled' },
    });

    if (existingAppointment) {
      console.warn('❌ DOUBLE BOOKING DETECTED:', {
        doctor: doctorId,
        date,
        slot,
        existingApptId: existingAppointment._id
      });
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked for this doctor. Please choose a different date or time slot.',
      });
    }
    console.log('✅ No double booking found');

    // Create the appointment (MongoDB unique index compound handles simultaneous race conditions)
    console.log('💾 Creating appointment in database...');
    const appointment = await Appointment.create({
      user: req.user.id,
      doctor: doctorId,
      date,
      slot,
      phone: phone || req.user.phone || '',
      notes,
      status: 'Pending',
    });
    console.log('✅ Appointment created:', appointment._id);

    // Populate references for email details
    console.log('📎 Populating user and doctor data...');
    const populated = await Appointment.findById(appointment._id)
      .populate('user', 'name email phone')
      .populate('doctor', 'name specialty');
    console.log('✅ Data populated');

    await logAudit(
      req.user._id,
      'APPOINTMENT_BOOKED',
      `Booked appointment with Dr. ${populated.doctor.name} on ${date} at ${slot}`,
      req
    );

    // Send confirmation email to client
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailBody = `
      <p>Hello ${populated.user.name},</p>
      <p>Your appointment booking has been submitted and is currently <strong>Pending approval</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Doctor:</td>
          <td style="padding: 10px 0; text-align: right;">Dr. ${populated.doctor.name} (${populated.doctor.specialty})</td>
        </tr>
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Date:</td>
          <td style="padding: 10px 0; text-align: right;">${date} (${dayName})</td>
        </tr>
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Time:</td>
          <td style="padding: 10px 0; text-align: right;">${slot}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Status:</td>
          <td style="padding: 10px 0; text-align: right; color: #ffb300; font-weight: bold;">Pending Review</td>
        </tr>
      </table>
      <p>We will notify you by email as soon as the appointment is approved by our team.</p>
    `;

    try {
      console.log('📧 SENDING BOOKING CONFIRMATION EMAIL:');
      console.log('  Recipient:', populated.user.email);
      console.log('  Doctor:', populated.doctor.name);
      console.log('  Date:', date);
      console.log('  Slot:', slot);
      
      await sendEmail({
        to: populated.user.email,
        subject: 'Appointment Booked — EverActive Physiotherapy',
        title: 'Booking Placed Successfully',
        bodyHtml: emailBody,
        buttonText: 'View Appointments',
        buttonUrl: `${frontendUrl}/my-appointments`,
      });
      console.log('✅ Booking confirmation email sent successfully');
    } catch (err) {
      console.error('❌ Booking email notification FAILED:', { 
        email: populated.user.email, 
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book a free session (15-min consultation or care home taster)
 * @route   POST /api/appointments/free-session
 * @access  Private
 */
export const bookFreeSession = async (req, res, next) => {
  try {
    const { type, phone, address, notes } = req.body;
    
    console.log('🎁 FREE SESSION BOOKING REQUEST:');
    console.log('  User ID:', req.user.id);
    console.log('  Session Type:', type);
    console.log('  Phone:', phone);
    console.log('  Address:', address || '(not provided)');
    console.log('  Timestamp:', new Date().toISOString());

    // Validate inputs
    if (!type || !['consultation', 'taster'].includes(type)) {
      console.warn('⚠️  VALIDATION FAILED: Invalid session type:', type);
      return res.status(400).json({ success: false, message: 'Please specify booking type: consultation or taster.' });
    }

    if (!phone) {
      console.warn('⚠️  VALIDATION FAILED: Phone number missing');
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Create free session appointment (no doctor assigned initially)
    console.log('💾 Creating free session appointment...');
    const appointment = await Appointment.create({
      user: req.user.id,
      doctor: null, // Free sessions don't have assigned doctors yet
      date: null,   // Admin will schedule after review
      slot: null,
      phone,
      address: address || '',
      appointmentType: type, // Save appointment type: 'consultation' or 'taster'
      notes: `${type === 'consultation' ? 'Free 15-Minute Consultation' : 'Care Home Free Taster Session'}\n${notes ? 'Details: ' + notes : ''}`,
      status: 'Pending',
    });

    // Populate for response and email
    const populated = await Appointment.findById(appointment._id)
      .populate('user', 'name email phone');

    await logAudit(
      req.user._id,
      'FREE_SESSION_BOOKED',
      `Booked ${type === 'consultation' ? 'Free 15-Minute Consultation' : 'Care Home Taster Session'}`,
      req
    );

    // Send confirmation email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const sessionType = type === 'consultation' ? 'Free 15-Minute Consultation' : 'Care Home Free Taster Session';
    
    const emailBody = `
      <p>Hello ${populated.user.name},</p>
      <p>Thank you for requesting a <strong>${sessionType}</strong>!</p>
      <p>We have received your booking request and will contact you within <strong>24 hours</strong> to confirm the date, time, and any additional details.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Session Type:</td>
          <td style="padding: 10px 0; text-align: right;">${sessionType}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Phone:</td>
          <td style="padding: 10px 0; text-align: right;">${phone}</td>
        </tr>
        ${address ? `
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Address:</td>
          <td style="padding: 10px 0; text-align: right;">${address}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Status:</td>
          <td style="padding: 10px 0; text-align: right; color: #ffb300; font-weight: bold;">Pending Confirmation</td>
        </tr>
      </table>
      <p>We will call or email you shortly to confirm your session date and time.</p>
      <p>If you have any questions, feel free to call us at <strong>+44 7542 221845</strong>.</p>
    `;

    try {
      console.log('📧 SENDING FREE SESSION CONFIRMATION EMAIL:');
      console.log('  Recipient:', populated.user.email);
      console.log('  Session Type:', sessionType);
      console.log('  Phone:', phone);
      
      await sendEmail({
        to: populated.user.email,
        subject: `${sessionType} Request Received — EverActive Physiotherapy`,
        title: 'Booking Request Confirmed',
        bodyHtml: emailBody,
        buttonText: 'View My Bookings',
        buttonUrl: `${frontendUrl}/my-appointments`,
      });
      console.log('✅ Free session confirmation email sent successfully');
    } catch (err) {
      console.error('❌ Free session confirmation email FAILED:', { 
        email: populated.user.email, 
        error: err.message,
        errorCode: err.code,
        timestamp: new Date().toISOString()
      });
    }

    // Also send notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@everactivephysiotherapy.com';
      console.log('📧 SENDING ADMIN NOTIFICATION EMAIL:');
      console.log('  Recipient:', adminEmail);
      console.log('  Booking Type:', sessionType);
      
      await sendEmail({
        to: adminEmail,
        subject: `New ${sessionType} Booking - Admin Action Required`,
        title: 'New Free Session Request',
        bodyHtml: `
          <p><strong>New ${sessionType} Request</strong></p>
          <p><strong>Patient:</strong> ${populated.user.name}</p>
          <p><strong>Email:</strong> ${populated.user.email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p>Please log in to the admin dashboard to confirm and schedule this session.</p>
        `,
        buttonText: 'Go to Admin Dashboard',
        buttonUrl: `${frontendUrl}/admin`,
      });
      console.log('✅ Admin notification email sent successfully');
    } catch (err) {
      console.error('❌ Admin notification email FAILED:', { 
        error: err.message,
        errorCode: err.code,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Free session request submitted successfully. We will contact you within 24 hours.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status (Approve, Complete, Cancel)
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Admin or Doctor)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Approved', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('doctor', 'name specialty');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Restrict cancellation/approval to admin, doctor, or the user themselves (if user cancels)
    if (req.user.role === 'user' && appointment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this booking.' });
    }

    if (req.user.role === 'user' && status !== 'Cancelled') {
      return res.status(403).json({ success: false, message: 'Users can only request cancellation.' });
    }

    appointment.status = status;
    await appointment.save();

    await logAudit(
      req.user._id,
      'APPOINTMENT_STATUS_CHANGED',
      `Appointment ID ${appointment._id} status changed to ${status}`,
      req
    );

    // Send email notification about status update
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let statusColor = '#ffb300'; // Pending
    if (status === 'Approved') statusColor = '#2e7d32'; // Green
    if (status === 'Completed') statusColor = '#1565c0'; // Blue
    if (status === 'Cancelled') statusColor = '#c62828'; // Red

    const sessionLabel = appointment.appointmentType === 'consultation'
      ? 'Free 15-Minute Consultation'
      : appointment.appointmentType === 'taster'
        ? 'Care Home Free Taster Session'
        : appointment.doctor
          ? `Dr. ${appointment.doctor.name}`
          : 'Your session';
    const scheduleLabel = appointment.date && appointment.slot
      ? `${appointment.date} at ${appointment.slot}`
      : 'To be confirmed by our team';

    const emailBody = `
      <p>Hello ${appointment.user.name},</p>
      <p>Your booking for <strong>${sessionLabel}</strong> has been updated.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Date & Time:</td>
          <td style="padding: 10px 0; text-align: right;">${scheduleLabel}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">New Status:</td>
          <td style="padding: 10px 0; text-align: right; color: ${statusColor}; font-weight: bold;">${status}</td>
        </tr>
      </table>
      ${status === 'Approved' ? '<p>We look forward to seeing you at our clinic!</p>' : ''}
      ${status === 'Cancelled' ? '<p>If you cancelled this by mistake or want to book another session, please book a new slot on our platform.</p>' : ''}
    `;

    try {
      await sendEmail({
        to: appointment.user.email,
        subject: `Appointment ${status} — EverActive Physiotherapy`,
        title: `Appointment ${status}`,
        bodyHtml: emailBody,
        buttonText: 'View Appointments',
        buttonUrl: `${frontendUrl}/my-appointments`,
      });
    } catch (err) {
      console.warn('Status update email failed to send:', err.message);
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule appointment
 * @route   PUT /api/appointments/:id/reschedule
 * @access  Private
 */
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, slot } = req.body;

    if (!date || !slot) {
      return res.status(400).json({ success: false, message: 'Please provide new date and time slot.' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('doctor', 'name specialty availability');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check authority: user must own the appointment unless they are admin/doctor
    if (req.user.role === 'user' && appointment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this booking.' });
    }

    if (!appointment.doctor) {
      return res.status(400).json({
        success: false,
        message: 'Free session bookings must be scheduled by assigning a specialist first.',
      });
    }

    // Verify slot matches doctor's availability schedule
    const dayName = getDayName(date);
    const daySchedule = appointment.doctor.availability.find((sched) => sched.day === dayName);

    if (!daySchedule || !daySchedule.slots.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${appointment.doctor.name} is not available on ${dayName} at ${slot}.`,
      });
    }

    // Check for double booking collision (excluding this specific appointment)
    const existingAppointment = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor._id,
      date,
      slot,
      status: { $ne: 'Cancelled' },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This slot is already booked for this doctor. Please choose a different date or time.',
      });
    }

    const oldDate = appointment.date;
    const oldSlot = appointment.slot;

    appointment.date = date;
    appointment.slot = slot;
    // Reset status back to Pending for client, unless rescheduled by admin/doctor directly
    appointment.status = req.user.role === 'user' ? 'Pending' : 'Approved';
    await appointment.save();

    await logAudit(
      req.user._id,
      'APPOINTMENT_RESCHEDULED',
      `Rescheduled Appointment ID ${appointment._id} from ${oldDate} ${oldSlot} to ${date} ${slot}`,
      req
    );

    // Send email notification about rescheduling
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailBody = `
      <p>Hello ${appointment.user.name},</p>
      <p>Your appointment with <strong>Dr. ${appointment.doctor.name}</strong> has been successfully rescheduled.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Old Date & Time:</td>
          <td style="padding: 10px 0; text-align: right; text-decoration: line-through; color: #888888;">${oldDate} at ${oldSlot}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">New Date & Time:</td>
          <td style="padding: 10px 0; text-align: right; color: #0052cc; font-weight: bold;">${date} at ${slot}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #555555;">Status:</td>
          <td style="padding: 10px 0; text-align: right; color: ${appointment.status === 'Pending' ? '#ffb300' : '#2e7d32'}; font-weight: bold;">
            ${appointment.status}
          </td>
        </tr>
      </table>
      <p>We will review your rescheduled request shortly.</p>
    `;

    try {
      await sendEmail({
        to: appointment.user.email,
        subject: 'Appointment Rescheduled — EverActive Physiotherapy',
        title: 'Booking Rescheduled',
        bodyHtml: emailBody,
        buttonText: 'View Appointments',
        buttonUrl: `${frontendUrl}/my-appointments`,
      });
    } catch (err) {
      console.warn('Reschedule email failed to send:', err.message);
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
