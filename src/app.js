/**
 * TurboForge API Proxy Application
 * Express application setup with middleware and routes
 */

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';

// Initialize Express app
const app = express();

// Apply security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use('/', routes);

// Error handling middleware
app.use(errorHandler);

export default app;