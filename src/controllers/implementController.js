/**
 * Implementation Controller
 * Handles requests for process implementation in ServiceNow
 */

import { v4 as uuidv4 } from 'uuid';
import n8nService from '../services/n8nService.js';
import operationService from '../services/operationService.js';
import logger from '../utils/logger.js';

/**
 * Initiates an implementation operation for a process
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const initiateImplementation = async (req, res) => {
  try {
    const processDefinition = req.body;
    
    // Generate a unique operation ID
    const operationId = uuidv4();
    
    // Log the implementation request
    logger.info(`Initiating implementation for process "${processDefinition.process.name}"`, {
      operationId,
      processName: processDefinition.process.name,
      milestoneCount: processDefinition.milestones.length
    });
    
    // Create operation in tracking service
    operationService.createOperation({
      id: operationId,
      type: 'implement',
      status: 'in_progress',
      data: {
        processName: processDefinition.process.name,
        processSummary: {
          milestoneCount: processDefinition.milestones.length,
          totalStepCount: processDefinition.milestones.reduce((acc, milestone) => 
            acc + (milestone.steps ? milestone.steps.length : 0), 0),
          totalQuestionCount: processDefinition.milestones.reduce((acc, milestone) => 
            acc + milestone.steps.reduce((stepAcc, step) => 
              stepAcc + (step.questions ? step.questions.length : 0), 0), 0)
        }
      }
    });
    
    // Send request to n8n workflow
    n8nService.triggerImplementationWorkflow({
      operationId,
      processDefinition
    });
    
    // Return response to client
    res.status(202).json({
      operation_id: operationId,
      status: 'in_progress',
      message: 'Implementation operation started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error initiating implementation:', error);
    
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
      message: 'An unexpected error occurred while initiating implementation',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};