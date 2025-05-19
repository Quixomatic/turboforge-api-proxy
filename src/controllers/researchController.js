/**
 * Research Controller
 * Handles requests for process research
 */

import { v4 as uuidv4 } from 'uuid';
import n8nService from '../services/n8nService.js';
import operationService from '../services/operationService.js';
import logger from '../utils/logger.js';

/**
 * Initiates a research operation for process creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const initiateResearch = async (req, res) => {
  try {
    const { processType, industry, additionalRequirements } = req.body;
    
    // Generate a unique operation ID
    const operationId = uuidv4();
    
    // Log the research request
    logger.info(`Initiating research for "${processType}" in "${industry}" industry`, {
      operationId,
      processType,
      industry,
      additionalRequirements: additionalRequirements || 'None'
    });
    
    // Create operation in tracking service
    operationService.createOperation({
      id: operationId,
      type: 'research',
      status: 'in_progress',
      data: {
        processType,
        industry,
        additionalRequirements
      }
    });
    
    // Send request to n8n workflow
    n8nService.triggerResearchWorkflow({
      operationId,
      processType,
      industry,
      additionalRequirements
    });
    
    // Return response to client
    res.status(202).json({
      operation_id: operationId,
      status: 'in_progress',
      message: 'Research operation started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error initiating research:', error);
    
    // If this is an operational error we're aware of
    if (error.isOperational) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        status: error.statusCode || 500,
        timestamp: new Date().toISOString()
      });
    }
    
    // For unexpected errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while initiating research',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};