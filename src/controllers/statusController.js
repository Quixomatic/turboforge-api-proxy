/**
 * Status Controller
 * Handles status check requests for operations
 */

import operationService from '../services/operationService.js';
import logger from '../utils/logger.js';

/**
 * Gets the status of an operation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getOperationStatus = async (req, res) => {
  try {
    const { operationId } = req.params;

    // Log the status check request
    logger.info(`Status check requested for operation: ${operationId}`);

    // Get operation from tracking service
    const operation = operationService.getOperation(operationId);

    if (!operation) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No operation found with ID: ${operationId}`,
        status: 404,
        timestamp: new Date().toISOString()
      });
    }

    // Build appropriate response based on operation status
    let response = {
      operation_id: operation.id,
      type: operation.type,
      status: operation.status,
      timestamp: operation.lastUpdated
    };

    // Include result data if operation is completed
    if (operation.status === 'completed' && operation.result) {
      // For research operations, include the full result
      // The AI model needs the complete research data
      response.result = operation.result;
    }

    // Include error data if operation failed
    if (operation.status === 'failed' && operation.error) {
      response.error = operation.error;
    }

    // Include progress information if available
    if (operation.progress) {
      response.progress = operation.progress;
    }

    // Return response to client
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error checking operation status:', error);

    // For unexpected errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while checking operation status',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};
