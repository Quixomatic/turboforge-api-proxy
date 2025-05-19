/**
 * Configuration Module
 * Loads and validates environment variables
 */

import { validateConfig } from './validator.js';

// Load configuration from environment variables
const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // n8n configuration
  n8nUrl: process.env.N8N_URL || 'http://localhost:5678/webhook',
  researchWebhook: process.env.RESEARCH_WEBHOOK || 'process-research',
  implementWebhook: process.env.IMPLEMENT_WEBHOOK || 'process-implementation',

  // Ollama configuration
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434/api',
  ollamaModel: process.env.OLLAMA_MODEL || 'turboforge-architect',

  // ServiceNow configuration
  servicenowInstance: process.env.SERVICENOW_INSTANCE || 'yourinstance.service-now.com',

  // API security (optional)
  apiKey: process.env.API_KEY || null,
  enableApiKeyAuth: process.env.ENABLE_API_KEY_AUTH === 'true',

  // Operation tracking
  operationExpiryHours: parseInt(process.env.OPERATION_EXPIRY_HOURS || '24', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate configuration
validateConfig(config);

export default config;