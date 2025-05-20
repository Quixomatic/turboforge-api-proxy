/**
 * Health Controller
 * Handles health check requests
 */

import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Performs a health check on the API and all connected services
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkHealth = async (req, res) => {
    try {
      // Create health status object
      const health = {
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || 'unknown',
        services: {
          api_proxy: {
            status: 'ok'
          }
        }
      };
      
      // Check n8n connection
      try {
        // n8n provides a REST API we can check - typically the root endpoint
        // For webhook-only access, we'll check if the URL is reachable
        const n8nUrl = new URL(config.n8nUrl);
        const n8nBaseUrl = `${n8nUrl.protocol}//${n8nUrl.host}`;
        
        const n8nResponse = await axios.get(n8nBaseUrl, { 
          timeout: 5000,
          validateStatus: status => status < 500 // Accept any non-5xx response as "reachable"
        });
        
        health.services.n8n = {
          url: config.n8nUrl,
          status: 'ok',
          webhooks: {
            research: config.researchWebhook,
            implement: config.implementWebhook
          }
        };
        
        logger.debug('n8n health check successful');
      } catch (error) {
        health.services.n8n = {
          url: config.n8nUrl,
          status: 'error',
          error: error.message,
          webhooks: {
            research: config.researchWebhook,
            implement: config.implementWebhook
          }
        };
        
        health.status = 'degraded';
        logger.warn('n8n health check failed:', error.message);
      }
      
      // Check Ollama connection
      try {
        // Ollama provides a /api/version endpoint we can use to check status
        const ollamaUrl = config.ollamaUrl.endsWith('/') 
          ? config.ollamaUrl + 'version'
          : config.ollamaUrl + '/version';
        
        const ollamaResponse = await axios.get(ollamaUrl, { 
          timeout: 5000 
        });
        
        health.services.ollama = {
          url: config.ollamaUrl,
          status: 'ok',
          version: ollamaResponse.data.version
        };
        
        // Check if the model is available
        try {
          const ollamaModelsUrl = config.ollamaUrl.endsWith('/') 
            ? config.ollamaUrl + 'tags'
            : config.ollamaUrl + '/tags';
          
          const modelsResponse = await axios.get(ollamaModelsUrl, { timeout: 5000 });
          
          // Check if our model is in the list
          const modelFound = modelsResponse.data.models && 
            modelsResponse.data.models.some(model => model.name.includes(config.ollamaModel));
          
          health.services.ollama.model = {
            name: config.ollamaModel,
            status: modelFound ? 'available' : 'not_found'
          };
          
          if (!modelFound) {
            health.services.ollama.status = 'degraded';
            health.status = 'degraded';
          }
        } catch (modelError) {
          health.services.ollama.model = {
            name: config.ollamaModel,
            status: 'unknown',
            error: modelError.message
          };
          
          health.services.ollama.status = 'degraded';
          health.status = 'degraded';
        }
        
        logger.debug('Ollama health check successful');
      } catch (error) {
        health.services.ollama = {
          url: config.ollamaUrl,
          status: 'error',
          error: error.message,
          model: {
            name: config.ollamaModel,
            status: 'unknown'
          }
        };
        
        health.status = 'degraded';
        logger.warn('Ollama health check failed:', error.message);
      }
      
      // If all required services have errors, mark as down
      const criticalServices = ['n8n', 'ollama'];
      const failedServices = criticalServices.filter(
        service => health.services[service]?.status === 'error'
      );
      
      if (failedServices.length === criticalServices.length) {
        health.status = 'down';
        logger.error('Health check: System is DOWN - all critical services unavailable');
      } else if (failedServices.length > 0 || health.status === 'degraded') {
        health.status = 'degraded';
        logger.warn('Health check: System is DEGRADED - some services unavailable');
      }
      
      // Log health check
      logger.debug('Health check performed', { 
        status: health.status,
        services: Object.keys(health.services)
          .map(k => `${k}: ${health.services[k].status}`)
          .join(', ')
      });
      
      // Return health status
      res.status(health.status === 'down' ? 503 : 200).json(health);
    } catch (error) {
      logger.error('Error during health check:', error);
      
      // Even on error, return a response to indicate the service is running
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };