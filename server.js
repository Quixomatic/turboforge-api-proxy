/**
 * TurboForge API Proxy Server
 * Entry point for the application
 */

// Load environment variables from .env file
import 'dotenv/config';

// Import application
import app from './src/app.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

// Start the server
const server = app.listen(config.port, () => {
  logger.info(`TurboForge API Proxy listening on port ${config.port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`n8n URL: ${config.n8nUrl}`);
  logger.info(`Ollama URL: ${config.ollamaUrl}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});