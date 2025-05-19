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

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Authentication Error';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Permission Denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource Not Found';
  }

  // Override status code if set in the error
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Override message if set in the error
  if (err.message) {
    message = err.message;
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