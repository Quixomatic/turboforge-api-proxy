/**
 * Callback Controller
 * Handles callbacks from n8n workflows
 */

import operationService from '../services/operationService.js';
import callbackService from '../services/callbackService.js';
import logger from '../utils/logger.js';

/**
 * Handles research workflow callbacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleResearchCallback = async (req, res) => {
  try {
    const { operationId } = req.params;
    const { success, result, error } = req.body;

    logger.info(`Received research callback for operation: ${operationId}`, {
      success,
      hasResult: !!result,
      hasError: !!error
    });

    // Log basic information about the research results if successful
    if (success && result && result.researchData && result.researchData.searchResults) {
      const resultCount = result.researchData.searchResults.length;
      logger.info(`Research returned ${resultCount} search results`, {
        operationId,
        processType: result.researchData.processType,
        industry: result.researchData.industry
      });

      // Log some details about each result (limited info to avoid excessive logging)
      result.researchData.searchResults.forEach((searchResult, idx) => {
        logger.debug(`Search result #${idx + 1}:`, {
          url: searchResult.url,
          title: searchResult.title,
          authorityScore: searchResult.authorityScore,
          contentLength: searchResult.content ? searchResult.content.length : 0
        });
      });
    }

    // Process callback through the callback service
    const processed = await callbackService.processResearchCallback({
      operationId,
      success,
      result,
      error
    });

    if (!processed) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No operation found with ID: ${operationId}`,
        status: 404,
        timestamp: new Date().toISOString()
      });
    }

    // Return response to n8n
    res.status(200).json({
      message: 'Callback processed successfully',
      operation_id: operationId,
      status: success ? 'completed' : 'failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing research callback:', error);

    // For unexpected errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing callback',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Handles implementation workflow callbacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleImplementCallback = async (req, res) => {
  try {
    const { operationId } = req.params;
    const { success, result, error } = req.body;

    logger.info(`Received implementation callback for operation: ${operationId}`, {
      success,
      hasResult: !!result,
      hasError: !!error
    });

    // Process callback through the callback service
    const processed = await callbackService.processImplementCallback({
      operationId,
      success,
      result,
      error
    });

    if (!processed) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No operation found with ID: ${operationId}`,
        status: 404,
        timestamp: new Date().toISOString()
      });
    }

    // Return response to n8n
    res.status(200).json({
      message: 'Callback processed successfully',
      operation_id: operationId,
      status: success ? 'completed' : 'failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing implementation callback:', error);

    // For unexpected errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing callback',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};
