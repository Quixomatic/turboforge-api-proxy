/**
 * Error Handler Middleware
 * Global error handling for the application
 */

import logger from '../utils/logger.js';

/**
 * Error handling middleware to provide consistent error responses
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error values
  let statusCode = 500;
  let message = 'Server Error';
  let errorDetails = undefined;

  // Handle operational errors (known application errors)
  if (err.isOperational) {
    statusCode = err.statusCode || 500;
    message = err.message;
    errorDetails = err.details;
  } 
  // Handle specific error types
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Authentication Error';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Permission Denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource Not Found';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Service Unavailable';
    errorDetails = 'Could not connect to external service';
  }

  // Send JSON response
  res.status(statusCode).json({
    error: message,
    details: errorDetails,
    status: statusCode,
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;