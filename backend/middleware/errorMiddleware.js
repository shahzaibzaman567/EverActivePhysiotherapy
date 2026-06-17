/**
 * Global error handler — ALWAYS returns JSON, never HTML.
 * Must be registered after all routes with 4 parameters (err, req, res, next).
 */
export const errorHandler = (err, req, res, next) => {
  // Defensive: if headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Force JSON content type on every error response
  res.setHeader('Content-Type', 'application/json');

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose / MongoDB errors ──────────────────────────────────────────
  // Bad ObjectId (e.g. invalid _id format)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found (invalid id: ${err.value})`;
  }

  // Duplicate key (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    if (
      err.message &&
      err.message.includes('appointments') &&
      err.message.includes('doctor_1_date_1_slot_1')
    ) {
      message =
        'This time slot is already booked. Please choose a different date or time slot.';
    } else {
      const fields = Object.keys(err.keyValue || {});
      message = `A record with this ${fields.join(', ')} already exists.`;
    }
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((v) => v.message)
      .join(', ');
  }

  // ── JWT errors ─────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // ── CORS errors ────────────────────────────────────────────────────────
  if (err.message && err.message.includes('CORS policy')) {
    statusCode = 403;
    message = 'CORS policy: request origin not allowed';
  }

  // ── Syntax / body parse errors ─────────────────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Log all 5xx errors
  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.originalUrl}`);
    console.error('Error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    status: statusCode,
    // Stack trace only in development — never leak internals to production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * 404 fallback — catches any request that didn't match a route.
 * Always returns JSON (prevents Express default HTML 404 page).
 */
export const notFound = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};
