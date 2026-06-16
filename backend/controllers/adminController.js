import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
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
 * @desc    Get dashboard stats (Overall clinic analytics)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDoctors = await Doctor.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});
    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const approvedAppointments = await Appointment.countDocuments({ status: 'Approved' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });

    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0];
    const nextMonthStartStr = nextMonthStart.toISOString().split('T')[0];

    const currentMonthAppointments = await Appointment.find({
      date: { $gte: currentMonthStartStr, $lt: nextMonthStartStr },
      status: { $ne: 'Cancelled' },
    });

    const currentMonthWeekBreakdown = [0, 0, 0, 0];
    const currentMonthUniquePatients = new Set();

    currentMonthAppointments.forEach((appt) => {
      const day = Number(appt.date.split('-')[2]);
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      currentMonthWeekBreakdown[weekIndex] += 1;
      if (appt.user) currentMonthUniquePatients.add(appt.user.toString());
    });

    const monthKeys = [];
    const monthlyTrendMap = {};
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push({ key, label: d.toLocaleString('en-GB', { month: 'short' }) });
      monthlyTrendMap[key] = 0;
    }

    const recentAppointments = await Appointment.find({
      status: { $ne: 'Cancelled' },
      date: { $ne: null },
    });

    recentAppointments.forEach((appt) => {
      const key = appt.date.slice(0, 7);
      if (monthlyTrendMap[key] !== undefined) {
        monthlyTrendMap[key] += 1;
      }
    });

    const monthlyTrend = monthKeys.map(({ key, label }) => ({ label, count: monthlyTrendMap[key] }));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendsMap = {};
    for (let i = 0; i < 7; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendsMap[dateStr] = 0;
    }

    const lastSevenDaysAppointments = await Appointment.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    lastSevenDaysAppointments.forEach((appt) => {
      const dateStr = appt.createdAt ? appt.createdAt.toISOString().split('T')[0] : null;
      if (dateStr && trendsMap[dateStr] !== undefined) {
        trendsMap[dateStr] += 1;
      }
    });

    const trends = Object.keys(trendsMap)
      .map((date) => ({ date, count: trendsMap[date] }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Doctor appointment breakdown
    const doctors = await Doctor.find({});
    const doctorStats = [];

    for (const doc of doctors) {
      const docApptCount = await Appointment.countDocuments({ doctor: doc._id, status: { $ne: 'Cancelled' } });
      doctorStats.push({
        name: doc.name,
        specialty: doc.specialty,
        appointments: docApptCount,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        completedAppointments,
        cancelledAppointments,
        currentMonthPatients: currentMonthAppointments.length,
        currentMonthUniquePatients: currentMonthUniquePatients.size,
        currentMonthWeekBreakdown,
        monthlyTrend,
      },
      trends,
      doctorStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Promote user / update role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'doctor', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role assignment' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent promoting user to self or deleting admin role from self
    if (user._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot demote yourself from admin role.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAudit(
      req.user._id,
      'USER_ROLE_PROMOTED',
      `Promoted User: ${user.name} (${user.email}) from ${oldRole} to ${role}`,
      req
    );

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit logs list
 * @route   GET /api/admin/audit-logs
 * @access  Private/Admin
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200); // Caps it to the last 200 logs for response efficiency

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
