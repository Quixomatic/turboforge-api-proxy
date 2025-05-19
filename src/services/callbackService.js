/**
 * Callback Service
 * Handles callbacks from n8n workflows
 */

import operationService from './operationService.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class CallbackService {
  constructor() {
    logger.info('Initialized callback service');
  }
  
  /**
   * Processes a research workflow callback
   * @param {Object} data - Callback data
   * @returns {boolean} - True if callback was processed, false otherwise
   */
  async processResearchCallback(data) {
    const { operationId, success, result, error } = data;
    
    // Get the operation
    const operation = operationService.getOperation(operationId);
    
    if (!operation) {
      logger.warn(`Research callback received for unknown operation: ${operationId}`);
      return false;
    }
    
    // Check operation type
    if (operation.type !== 'research') {
      logger.warn(`Type mismatch in research callback: ${operation.type}`, {
        operationId
      });
    }
    
    // Handle success case
    if (success) {
      logger.info(`Research operation completed successfully: ${operationId}`);
      
      // Process the research result
      let processedResult = result;
      
      // Add any post-processing of research results here
      if (processedResult.sources) {
        // Sort sources by relevance or authority
        processedResult.sources = processedResult.sources.sort(
          (a, b) => (b.authorityScore || 0) - (a.authorityScore || 0)
        );
      }
      
      // Add metadata about successful research
      processedResult = {
        ...processedResult,
        metadata: {
          serviceNowInstance: config.servicenowInstance,
          timestamp: new Date().toISOString(),
          processingTime: this._calculateProcessingTime(operation.created),
          confidence: processedResult.confidence || {
            overall: 'medium'
          }
        }
      };
      
      // Mark operation as complete
      operationService.completeOperation(operationId, processedResult);
      
      return true;
    }
    
    // Handle error case
    else {
      logger.error(`Research operation failed: ${operationId}`, {
        error
      });
      
      // Format error info
      const errorInfo = typeof error === 'string' 
        ? { message: error } 
        : error;
      
      // Mark operation as failed
      operationService.failOperation(operationId, {
        ...errorInfo,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }
  }
  
  /**
   * Processes an implementation workflow callback
   * @param {Object} data - Callback data
   * @returns {boolean} - True if callback was processed, false otherwise
   */
  async processImplementCallback(data) {
    const { operationId, success, result, error } = data;
    
    // Get the operation
    const operation = operationService.getOperation(operationId);
    
    if (!operation) {
      logger.warn(`Implementation callback received for unknown operation: ${operationId}`);
      return false;
    }
    
    // Check operation type
    if (operation.type !== 'implement') {
      logger.warn(`Type mismatch in implementation callback: ${operation.type}`, {
        operationId
      });
    }
    
    // Handle success case
    if (success) {
      logger.info(`Implementation operation completed successfully: ${operationId}`);
      
      // Process the implementation result
      let processedResult = result;
      
      // Generate ServiceNow links for the created records
      processedResult = {
        ...processedResult,
        links: this._generateServiceNowLinks(processedResult),
        metadata: {
          serviceNowInstance: config.servicenowInstance,
          timestamp: new Date().toISOString(),
          processingTime: this._calculateProcessingTime(operation.created)
        }
      };
      
      // Mark operation as complete
      operationService.completeOperation(operationId, processedResult);
      
      return true;
    }
    
    // Handle error case
    else {
      logger.error(`Implementation operation failed: ${operationId}`, {
        error
      });
      
      // Format error info
      const errorInfo = typeof error === 'string' 
        ? { message: error } 
        : error;
      
      // Mark operation as failed
      operationService.failOperation(operationId, {
        ...errorInfo,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }
  }
  
  /**
   * Calculates processing time in milliseconds
   * @private
   * @param {string} startTime - ISO timestamp of operation start
   * @returns {number} - Processing time in milliseconds
   */
  _calculateProcessingTime(startTime) {
    const start = new Date(startTime).getTime();
    const end = new Date().getTime();
    return end - start;
  }
  
  /**
   * Generates ServiceNow links for created records
   * @private
   * @param {Object} result - Implementation result
   * @returns {Object} - Object containing links
   */
  _generateServiceNowLinks(result) {
    const instance = config.servicenowInstance;
    const links = {};
    
    // Admin view link
    if (result.processId) {
      links.admin = `https://${instance}/x_312987_turbofo_0_process.do?sys_id=${result.processId}`;
    }
    
    // User view link
    if (result.processId) {
      links.user = `https://${instance}/sp?id=tf_step_form&process=${result.processId}`;
    }
    
    // Process list link
    links.processList = `https://${instance}/nav_to.do?uri=x_312987_turbofo_0_process_list.do`;
    
    return links;
  }
}

// Export a singleton instance
export default new CallbackService();