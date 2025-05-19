/**
 * TurboForge API Proxy Application
 * Express application setup with middleware and routes
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import authenticate from './middleware/authenticate.js';
import rateLimiter from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';
import config from './config/index.js';

// Initialize Express app
const app = express();

// Apply security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Request logging 
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter({ 
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
}));

// Authentication
app.use(authenticate);

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Log that the app is ready
logger.info(`TurboForge API Proxy initialized (${config.nodeEnv} mode)`);

export default app;