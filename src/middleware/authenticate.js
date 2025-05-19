/**
 * Authentication Middleware
 * Handles API key authentication
 */

import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware for API key authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  // Skip authentication if not enabled
  if (!config.enableApiKeyAuth) {
    return next();
  }

  // Get API key from request headers
  const apiKey = req.headers['x-api-key'];

  // Validate API key
  if (!apiKey || apiKey !== config.apiKey) {
    logger.warn('Authentication failed: Invalid or missing API key', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method
    });

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key',
      status: 401,
      timestamp: new Date().toISOString()
    });
  }

  // Authentication successful
  logger.debug('Authentication successful', {
    path: req.originalUrl,
    method: req.method
  });

  next();
};

export default authenticate;