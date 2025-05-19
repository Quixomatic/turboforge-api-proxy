/**
 * Rate Limiter Middleware
 * Implements basic rate limiting to protect API endpoints
 */

import logger from '../utils/logger.js';

// In-memory store for request counts
// In production, use Redis or another shared store
const requestStore = {
  requests: new Map(),
  resetTime: Date.now() + (60 * 1000), // Reset every minute
};

// Default rate limit settings
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Creates a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @returns {Function} - Express middleware function
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;

  // Reset function for the request store
  const resetStore = () => {
    requestStore.requests.clear();
    requestStore.resetTime = Date.now() + windowMs;
  };

  return (req, res, next) => {
    // Check if it's time to reset the store
    const now = Date.now();
    if (now >= requestStore.resetTime) {
      resetStore();
    }

    // Get client identifier (IP address or API key if available)
    const clientId = req.headers['x-api-key'] || req.ip;

    // Get current request count for this client
    const requestCount = requestStore.requests.get(clientId) || 0;

    // Check if rate limit exceeded
    if (requestCount >= maxRequests) {
      logger.warn(`Rate limit exceeded for client: ${clientId}`, {
        clientId,
        requestCount,
        maxRequests,
        path: req.originalUrl,
        method: req.method
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, please try again later',
        status: 429,
        timestamp: new Date().toISOString()
      });
    }

    // Increment request count
    requestStore.requests.set(clientId, requestCount + 1);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - (requestCount + 1));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestStore.resetTime / 1000));

    next();
  };
};

export default rateLimiter;