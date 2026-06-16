import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';

// Helper to log audit actions
const logAudit = async (userId, action, details, req) => {
  try {
    await AuditLog.create({
      user: userId || null,
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
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a new review
 * @route   POST /api/reviews
 * @access  Public (Optional Auth)
 */
export const createReview = async (req, res, next) => {
  try {
    const { name, rating, text, youtubeUrl } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({ success: false, message: 'Please provide name, rating, and description text.' });
    }

    const review = await Review.create({
      user: req.user ? req.user.id : undefined,
      name,
      rating,
      text,
      youtubeUrl: youtubeUrl || undefined,
    });

    await logAudit(
      req.user ? req.user.id : null,
      'REVIEW_CREATED',
      `Review submitted by ${name} (Rating: ${rating})`,
      req
    );

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
