/**
 * Research API Tests
 * Tests for the research API endpoint
 */

import request from 'supertest';
import app from '../../src/app.js';
import n8nService from '../../src/services/n8nService.js';
import operationService from '../../src/services/operationService.js';

// Mock dependencies
jest.mock('../../src/services/n8nService.js', () => ({
  triggerResearchWorkflow: jest.fn()
}));

jest.mock('../../src/services/operationService.js', () => ({
  createOperation: jest.fn(),
  getOperation: jest.fn(),
  completeOperation: jest.fn(),
  failOperation: jest.fn()
}));

describe('Research API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/research', () => {
    it('should return 400 if processType is missing', async () => {
      const response = await request(app)
        .post('/api/research')
        .send({
          industry: 'financial services'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details).toContain('Process type is required');
    });

    it('should return 400 if industry is missing', async () => {
      const response = await request(app)
        .post('/api/research')
        .send({
          processType: 'loan origination'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details).toContain('Industry is required');
    });

    it('should return 202 with operation ID for valid request', async () => {
      // Setup mocks
      n8nService.triggerResearchWorkflow.mockResolvedValue({});
      operationService.createOperation.mockImplementation(() => {});

      const response = await request(app)
        .post('/api/research')
        .send({
          processType: 'loan origination',
          industry: 'financial services',
          additionalRequirements: 'TRID compliance'
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('operation_id');
      expect(response.body).toHaveProperty('status', 'in_progress');
      expect(response.body).toHaveProperty('message', 'Research operation started');
      expect(response.body).toHaveProperty('timestamp');

      // Verify mocks were called
      expect(operationService.createOperation).toHaveBeenCalledTimes(1);
      expect(n8nService.triggerResearchWorkflow).toHaveBeenCalledTimes(1);
      expect(n8nService.triggerResearchWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          processType: 'loan origination',
          industry: 'financial services',
          additionalRequirements: 'TRID compliance'
        })
      );
    });

    it('should return 502 if n8n service fails', async () => {
      // Setup mocks
      n8nService.triggerResearchWorkflow.mockRejectedValue({
        isOperational: true,
        statusCode: 502,
        message: 'Failed to trigger research workflow'
      });

      const response = await request(app)
        .post('/api/research')
        .send({
          processType: 'loan origination',
          industry: 'financial services'
        });

      expect(response.status).toBe(502);
      expect(response.body).toHaveProperty('error', 'Failed to trigger research workflow');
    });
  });
});