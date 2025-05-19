/**
 * Logger Utility
 * Provides consistent logging throughout the application
 */

import winston from 'winston';
import config from '../config/index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `${timestamp} ${level.toUpperCase()}: ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // Write to error log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // Write to combined log
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ],
  // Allow for uncaught exception logging
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log'
    })
  ],
  exitOnError: false
});

export default logger;