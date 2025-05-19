/**
 * Logger Middleware
 * Custom request logging middleware
 */

import logger from '../utils/logger.js';

/**
 * Middleware to log request details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Start time for request duration calculation
  const start = new Date();
  
  // Generate a unique request ID
  const requestId = req.headers['x-request-id'] || 
                   `req-${Math.random().toString(36).substring(2, 10)}`;
  
  // Attach requestId to request object for use in other middleware/controllers
  req.requestId = requestId;

  // Log the incoming request
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Once the response is finished, log the outcome
  res.on('finish', () => {
    const duration = new Date() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`Completed ${req.method} ${req.originalUrl} with status ${res.statusCode} in ${duration}ms`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};

export default requestLogger;