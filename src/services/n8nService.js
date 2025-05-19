/**
 * n8n Service
 * Handles communication with n8n workflows
 */

import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class N8nService {
  constructor() {
    this.n8nUrl = config.n8nUrl;
    this.researchWebhook = config.researchWebhook;
    this.implementWebhook = config.implementWebhook;
    
    // Ensure URLs end with a slash if not already
    if (!this.n8nUrl.endsWith('/')) {
      this.n8nUrl += '/';
    }
    
    logger.info(`Initialized n8n service with URL: ${this.n8nUrl}`);
  }
  
  /**
   * Triggers the research workflow in n8n
   * @param {Object} data - Data for the research operation
   * @returns {Promise<Object>} - The response from n8n
   */
  async triggerResearchWorkflow(data) {
    try {
      const webhookUrl = `${this.n8nUrl}${this.researchWebhook}`;
      
      logger.info(`Triggering research workflow at: ${webhookUrl}`, {
        operationId: data.operationId,
        processType: data.processType
      });
      
      // Build webhook payload
      const payload = {
        operationId: data.operationId,
        processType: data.processType,
        industry: data.industry,
        additionalRequirements: data.additionalRequirements,
        callbackUrl: this._buildCallbackUrl(data.operationId, 'research')
      };
      
      // Send request to n8n webhook
      const response = await axios.post(webhookUrl, payload);
      
      logger.debug('Research workflow triggered successfully', {
        operationId: data.operationId,
        status: response.status
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error triggering research workflow:', error);
      
      throw {
        isOperational: true,
        statusCode: 502,
        message: 'Failed to trigger research workflow',
        originalError: error.message
      };
    }
  }
  
  /**
   * Triggers the implementation workflow in n8n
   * @param {Object} data - Data for the implementation operation
   * @returns {Promise<Object>} - The response from n8n
   */
  async triggerImplementationWorkflow(data) {
    try {
      const webhookUrl = `${this.n8nUrl}${this.implementWebhook}`;
      
      logger.info(`Triggering implementation workflow at: ${webhookUrl}`, {
        operationId: data.operationId,
        processName: data.processDefinition.process.name
      });
      
      // Build webhook payload
      const payload = {
        operationId: data.operationId,
        processDefinition: data.processDefinition,
        callbackUrl: this._buildCallbackUrl(data.operationId, 'implement')
      };
      
      // Send request to n8n webhook
      const response = await axios.post(webhookUrl, payload);
      
      logger.debug('Implementation workflow triggered successfully', {
        operationId: data.operationId,
        status: response.status
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error triggering implementation workflow:', error);
      
      throw {
        isOperational: true,
        statusCode: 502,
        message: 'Failed to trigger implementation workflow',
        originalError: error.message
      };
    }
  }
  
  /**
   * Builds a callback URL for n8n to report results
   * @private
   * @param {string} operationId - The operation ID
   * @param {string} type - The operation type (research or implement)
   * @returns {string} - The callback URL
   */
  _buildCallbackUrl(operationId, type) {
    // In production, this would use environment variables or config
    // to determine the externally accessible URL of the API proxy
    
    // For simplicity, we'll hardcode it based on the running environment
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/callback/${type}/${operationId}`;
  }
}

// Export a singleton instance
export default new N8nService();