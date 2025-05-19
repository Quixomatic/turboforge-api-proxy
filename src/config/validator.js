/**
 * Configuration Validator
 * Validates the configuration and logs warnings or errors
 */

/**
 * Validates configuration and logs warnings for missing or invalid values
 * @param {Object} config - Configuration object
 */
export function validateConfig(config) {
    // Check n8n URL
    if (!config.n8nUrl.startsWith('http')) {
      console.warn(`Warning: N8N_URL doesn't start with http(s) - current value: ${config.n8nUrl}`);
    }
  
    // Check Ollama URL
    if (!config.ollamaUrl.startsWith('http')) {
      console.warn(`Warning: OLLAMA_URL doesn't start with http(s) - current value: ${config.ollamaUrl}`);
    }
  
    // Check webhook names
    if (!config.researchWebhook) {
      console.warn('Warning: RESEARCH_WEBHOOK is not set. Using default: process-research');
    }
  
    if (!config.implementWebhook) {
      console.warn('Warning: IMPLEMENT_WEBHOOK is not set. Using default: process-implementation');
    }
  
    // Check ServiceNow instance
    if (config.servicenowInstance.includes('yourinstance')) {
      console.warn(`Warning: SERVICENOW_INSTANCE is set to a default value: ${config.servicenowInstance}`);
    }
  
    // API Key auth configuration
    if (config.enableApiKeyAuth && !config.apiKey) {
      console.error('Error: API Key authentication is enabled but API_KEY is not set');
      process.exit(1);
    }
  
    // Operation expiry validation
    if (isNaN(config.operationExpiryHours) || config.operationExpiryHours <= 0) {
      console.warn('Warning: Invalid OPERATION_EXPIRY_HOURS. Using default: 24');
      config.operationExpiryHours = 24;
    }
  
    // Log level validation
    const validLogLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
    if (!validLogLevels.includes(config.logLevel)) {
      console.warn(`Warning: Invalid LOG_LEVEL: ${config.logLevel}. Using default: info`);
      config.logLevel = 'info';
    }
  }