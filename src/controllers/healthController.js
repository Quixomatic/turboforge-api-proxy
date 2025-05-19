/**
 * Health Controller
 * Handles health check requests
 */

import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Performs a health check on the API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkHealth = async (req, res) => {
  try {
    // Basic health check - more comprehensive checks could be added here
    // such as database connectivity, n8n availability, etc.
    
    const health = {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
      services: {
        n8n: {
          url: config.n8nUrl,
          status: 'unknown' // Could check connectivity
        },
        ollama: {
          url: config.ollamaUrl,
          model: config.ollamaModel,
          status: 'unknown' // Could check connectivity
        }
      }
    };
    
    // Log health check
    logger.debug('Health check performed', { health });
    
    // Return health status
    res.status(200).json(health);
  } catch (error) {
    logger.error('Error during health check:', error);
    
    // Even on error, return a response to indicate the service is running
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
};