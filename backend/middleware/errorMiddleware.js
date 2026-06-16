// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for the developer
  console.error('Error Details:', err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Check if duplicate is on the Appointment unique slot index
    if (err.message && err.message.includes('appointments') && err.message.includes('doctor_1_date_1_slot_1')) {
      message = 'This time slot has already been booked for this doctor. Please choose a different date or time slot.';
    } else {
      // Generic duplicate field name parsing
      const fields = Object.keys(err.keyValue || {});
      message = `A record with this ${fields.join(', ')} already exists.`;
    }
    error = { status: 409, message }; // 409 Conflict
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { status: 400, message };
  }

  const statusCode = error.status || err.statusCode || 500;
  const responseMessage = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    // Include stack trace only in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// 404 Not Found fallback middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
