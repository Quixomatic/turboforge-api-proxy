/**
 * Operation Service Tests
 * Unit tests for the operation tracking service
 */

import operationService from '../../src/services/operationService.js';

// Mock config to control cleanup behavior
jest.mock('../../src/config/index.js', () => ({
  operationExpiryHours: 24
}));

describe('Operation Service', () => {
  beforeEach(() => {
    // Clear operations between tests
    operationService.operations.clear();
  });

  describe('createOperation', () => {
    it('should create a new operation with provided data', () => {
      const operation = operationService.createOperation({
        id: 'test-op-1',
        type: 'research',
        status: 'in_progress',
        data: { processType: 'loan origination' }
      });

      expect(operation).toHaveProperty('id', 'test-op-1');
      expect(operation).toHaveProperty('type', 'research');
      expect(operation).toHaveProperty('status', 'in_progress');
      expect(operation).toHaveProperty('data.processType', 'loan origination');
      expect(operation).toHaveProperty('created');
      expect(operation).toHaveProperty('lastUpdated');
      expect(operation).toHaveProperty('expiry');
    });

    it('should throw an error if operation ID is not provided', () => {
      expect(() => {
        operationService.createOperation({
          type: 'research',
          status: 'in_progress'
        });
      }).toThrow('Operation ID is required');
    });

    it('should use default values for optional fields', () => {
      const operation = operationService.createOperation({
        id: 'test-op-2'
      });

      expect(operation).toHaveProperty('type', 'unknown');
      expect(operation).toHaveProperty('status', 'pending');
      expect(operation.data).toEqual({});
    });
  });

  describe('getOperation', () => {
    it('should retrieve an existing operation', () => {
      // Create test operation
      operationService.createOperation({
        id: 'test-op-3',
        type: 'research',
        status: 'in_progress'
      });

      // Retrieve the operation
      const operation = operationService.getOperation('test-op-3');

      expect(operation).toHaveProperty('id', 'test-op-3');
      expect(operation).toHaveProperty('type', 'research');
      expect(operation).toHaveProperty('status', 'in_progress');
    });

    it('should return null for non-existent operation', () => {
      const operation = operationService.getOperation('non-existent-id');
      expect(operation).toBeNull();
    });

    it('should return null for expired operations', () => {
      // Create test operation with past expiry
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago

      const operation = {
        id: 'expired-op',
        type: 'research',
        status: 'in_progress',
        created: pastDate.toISOString(),
        lastUpdated: pastDate.toISOString(),
        expiry: pastDate.toISOString(),
        data: {}
      };

      operationService.operations.set('expired-op', operation);

      // Try to retrieve the expired operation
      const result = operationService.getOperation('expired-op');
      expect(result).toBeNull();
    });
  });

  describe('updateOperation', () => {
    it('should update an existing operation', () => {
      // Create test operation
      operationService.createOperation({
        id: 'test-op-4',
        type: 'research',
        status: 'in_progress',
        data: { processType: 'loan origination' }
      });

      // Update the operation
      const updatedOperation = operationService.updateOperation('test-op-4', {
        status: 'completed',
        data: { processType: 'loan origination', result: 'success' }
      });

      expect(updatedOperation).toHaveProperty('status', 'completed');
      expect(updatedOperation).toHaveProperty('data.result', 'success');
      expect(updatedOperation.lastUpdated).not.toBe(updatedOperation.created);
    });

    it('should return null for non-existent operation', () => {
      const result = operationService.updateOperation('non-existent-id', {
        status: 'completed'
      });
      expect(result).toBeNull();
    });
  });

  describe('completeOperation', () => {
    it('should mark an operation as completed with result', () => {
      // Create test operation
      operationService.createOperation({
        id: 'test-op-5',
        type: 'research',
        status: 'in_progress'
      });

      // Complete the operation
      const result = { findings: ['data point 1', 'data point 2'] };
      const completedOperation = operationService.completeOperation('test-op-5', result);

      expect(completedOperation).toHaveProperty('status', 'completed');
      expect(completedOperation).toHaveProperty('result', result);
      expect(completedOperation).toHaveProperty('completed');
    });
  });

  describe('failOperation', () => {
    it('should mark an operation as failed with error', () => {
      // Create test operation
      operationService.createOperation({
        id: 'test-op-6',
        type: 'research',
        status: 'in_progress'
      });

      // Fail the operation
      const error = { message: 'Something went wrong', code: 'ERROR_CODE' };
      const failedOperation = operationService.failOperation('test-op-6', error);

      expect(failedOperation).toHaveProperty('status', 'failed');
      expect(failedOperation).toHaveProperty('error', error);
      expect(failedOperation).toHaveProperty('completed');
    });
  });

  describe('removeOperation', () => {
    it('should remove an existing operation', () => {
      // Create test operation
      operationService.createOperation({
        id: 'test-op-7',
        type: 'research',
        status: 'in_progress'
      });

      // Verify operation exists
      expect(operationService.getOperation('test-op-7')).not.toBeNull();

      // Remove the operation
      const result = operationService.removeOperation('test-op-7');
      expect(result).toBe(true);

      // Verify operation no longer exists
      expect(operationService.getOperation('test-op-7')).toBeNull();
    });

    it('should return false for non-existent operation', () => {
      const result = operationService.removeOperation('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('_cleanupExpiredOperations', () => {
    it('should remove expired operations', () => {
      // Create current operation
      operationService.createOperation({
        id: 'current-op',
        type: 'research',
        status: 'in_progress'
      });

      // Create expired operation
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago

      const expiredOp = {
        id: 'expired-op',
        type: 'research',
        status: 'in_progress',
        created: pastDate.toISOString(),
        lastUpdated: pastDate.toISOString(),
        expiry: pastDate.toISOString(),
        data: {}
      };

      operationService.operations.set('expired-op', expiredOp);

      // Run cleanup
      operationService._cleanupExpiredOperations();

      // Check results
      expect(operationService.operations.has('current-op')).toBe(true);
      expect(operationService.operations.has('expired-op')).toBe(false);
    });
  });
});