/**
 * Operation Service
 * Manages operation tracking and status
 */

import config from '../config/index.js';
import logger from '../utils/logger.js';

class OperationService {
  constructor() {
    // In-memory storage for operations
    // In a production environment, this would use a database
    this.operations = new Map();
    
    // Set up periodic cleanup of old operations
    this.expiryHours = config.operationExpiryHours;
    
    logger.info(`Initialized operation service with ${this.expiryHours}h expiry`);
    
    // Start cleanup task
    this._startCleanupTask();
  }
  
  /**
   * Creates a new operation
   * @param {Object} operation - Operation data
   * @returns {Object} - The created operation
   */
  createOperation(operation) {
    if (!operation.id) {
      throw new Error('Operation ID is required');
    }
    
    const now = new Date().toISOString();
    
    const newOperation = {
      id: operation.id,
      type: operation.type || 'unknown',
      status: operation.status || 'pending',
      data: operation.data || {},
      created: now,
      lastUpdated: now,
      expiry: this._calculateExpiry()
    };
    
    // Store the operation
    this.operations.set(operation.id, newOperation);
    
    logger.debug('Operation created', { 
      operationId: operation.id, 
      type: operation.type,
      status: operation.status
    });
    
    return newOperation;
  }
  
  /**
   * Gets an operation by ID
   * @param {string} id - Operation ID
   * @returns {Object|null} - The operation or null if not found
   */
  getOperation(id) {
    if (!this.operations.has(id)) {
      logger.debug(`Operation not found: ${id}`);
      return null;
    }
    
    const operation = this.operations.get(id);
    
    // Check if operation has expired
    if (new Date(operation.expiry) < new Date()) {
      logger.debug(`Operation expired: ${id}`);
      this.operations.delete(id);
      return null;
    }
    
    return operation;
  }
  
  /**
   * Updates an existing operation
   * @param {string} id - Operation ID
   * @param {Object} updates - Properties to update
   * @returns {Object|null} - The updated operation or null if not found
   */
  updateOperation(id, updates) {
    const operation = this.getOperation(id);
    
    if (!operation) {
      logger.debug(`Cannot update non-existent operation: ${id}`);
      return null;
    }
    
    // Apply updates
    const updatedOperation = {
      ...operation,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // Store updated operation
    this.operations.set(id, updatedOperation);
    
    logger.debug(`Operation updated: ${id}`, { 
      status: updatedOperation.status
    });
    
    return updatedOperation;
  }
  
  /**
   * Completes an operation with a result
   * @param {string} id - Operation ID
   * @param {Object} result - Operation result
   * @returns {Object|null} - The completed operation or null if not found
   */
  completeOperation(id, result) {
    return this.updateOperation(id, {
      status: 'completed',
      result,
      completed: new Date().toISOString()
    });
  }
  
  /**
   * Fails an operation with an error
   * @param {string} id - Operation ID
   * @param {string|Object} error - Error details
   * @returns {Object|null} - The failed operation or null if not found
   */
  failOperation(id, error) {
    return this.updateOperation(id, {
      status: 'failed',
      error,
      completed: new Date().toISOString()
    });
  }
  
  /**
   * Updates operation progress
   * @param {string} id - Operation ID
   * @param {Object} progress - Progress information
   * @returns {Object|null} - The updated operation or null if not found
   */
  updateProgress(id, progress) {
    return this.updateOperation(id, {
      progress
    });
  }
  
  /**
   * Removes an operation from storage
   * @param {string} id - Operation ID
   * @returns {boolean} - True if operation was deleted, false otherwise
   */
  removeOperation(id) {
    if (!this.operations.has(id)) {
      return false;
    }
    
    this.operations.delete(id);
    logger.debug(`Operation removed: ${id}`);
    return true;
  }
  
  /**
   * Calculates expiry timestamp
   * @private
   * @returns {string} - ISO timestamp for expiry
   */
  _calculateExpiry() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + this.expiryHours);
    return expiry.toISOString();
  }
  
  /**
   * Starts the periodic cleanup task
   * @private
   */
  _startCleanupTask() {
    // Run cleanup every hour
    setInterval(() => {
      this._cleanupExpiredOperations();
    }, 60 * 60 * 1000);
    
    // Also run it once at startup
    this._cleanupExpiredOperations();
  }
  
  /**
   * Cleans up expired operations
   * @private
   */
  _cleanupExpiredOperations() {
    const now = new Date();
    let cleanupCount = 0;
    
    for (const [id, operation] of this.operations.entries()) {
      if (new Date(operation.expiry) < now) {
        this.operations.delete(id);
        cleanupCount++;
      }
    }
    
    if (cleanupCount > 0) {
      logger.info(`Cleaned up ${cleanupCount} expired operations`);
    }
  }
}

// Export a singleton instance
export default new OperationService();