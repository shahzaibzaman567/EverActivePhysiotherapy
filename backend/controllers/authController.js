import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../config/nodemailer.js';
import { isAdminEmail } from '../config/admin.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_local_dev', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

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

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    // Determine role from the configured admin email only
    let role = 'user';
    if (isAdminEmail(normalizedEmail)) {
      role = 'admin';
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
    });

    const token = generateToken(user._id);

    // Create Audit Log
    await logAudit(user._id, 'USER_SIGNUP', `User signed up with email ${normalizedEmail}. Role assigned: ${role}`, req);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    console.log('🔐 LOGIN ATTEMPT:');
    console.log('  Email:', normalizedEmail);
    console.log('  Password:', password ? '✓ provided' : '✗ missing');

    // Validate email & password
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user (select password explicitly)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    console.log('  User found:', !!user);
    
    if (!user) {
      console.log('  ✗ User not found in database');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('  User email (db):', user.email);
    console.log('  User role:', user.role);

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('  Password match:', isMatch);
    
    if (!isMatch) {
      console.log('  ✗ Password mismatch');
      // Log failed login attempt
      await logAudit(user._id, 'USER_LOGIN_FAILED', `Failed login attempt for email ${normalizedEmail}`, req);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Create Audit Log
    await logAudit(user._id, 'USER_LOGIN_SUCCESS', `User logged in successfully`, req);

    console.log('  ✅ Login successful for:', email);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone ?? user.phone;
      
      // If updating email, check if it's already taken
      if (req.body.email && req.body.email.toLowerCase() !== user.email) {
        const newEmail = normalizeEmail(req.body.email);
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email already taken by another account' });
        }
        user.email = newEmail;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      await logAudit(user._id, 'USER_PROFILE_UPDATED', `User profile updated.`, req);

      res.status(200).json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // For security, don't confirm or deny user existence in public message.
      // Simply return success to prevent username harvesting.
      return res.status(200).json({ success: true, message: 'Email sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const bodyHtml = `
      <p>You are receiving this email because you (or someone else) requested a password reset for your EverActive Physiotherapy account.</p>
      <p>Please click the button below to complete the password reset process. This link is only valid for 10 minutes.</p>
      <p style="background-color: #fff8e1; border-left: 4px solid #ffb300; padding: 10px; font-size: 14px; color: #5d4037;">
        <strong>If you did not request this</strong>, please ignore this email. Your password will remain secure and unchanged.
      </p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request — EverActive Physiotherapy',
        title: 'Reset Your Password',
        bodyHtml,
        buttonText: 'Reset Password',
        buttonUrl: resetUrl,
      });

      await logAudit(user._id, 'USER_FORGOT_PASSWORD_REQUESTED', `Password reset email sent to ${normalizedEmail}`, req);

      res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/reset-password/:resettoken
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Create Audit Log
    await logAudit(user._id, 'USER_PASSWORD_RESET_SUCCESS', `Password reset completed successfully.`, req);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
