/**
 * Async Handler Utility
 * Wraps async route handlers to catch and forward errors
 */

/**
 * Wraps an async route handler to catch errors and pass them to next()
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;