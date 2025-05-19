/**
 * Implementation Controller Tests
 * Tests for the implementation API endpoint
 */

import request from 'supertest';
import app from '../../src/app.js';
import n8nService from '../../src/services/n8nService.js';
import operationService from '../../src/services/operationService.js';
import { sampleLoanOriginationProcess } from '../mocks/processDefinitions.js';

// Mock dependencies
jest.mock('../../src/services/n8nService.js', () => ({
  triggerImplementationWorkflow: jest.fn()
}));

jest.mock('../../src/services/operationService.js', () => ({
  createOperation: jest.fn(),
  getOperation: jest.fn(),
  completeOperation: jest.fn(),
  failOperation: jest.fn()
}));

describe('Implementation API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/implement', () => {
    it('should return 400 if process is missing', async () => {
      const response = await request(app)
        .post('/api/implement')
        .send({
          milestones: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details).toContain('Process definition is required');
    });

    it('should return 400 if milestones are missing', async () => {
      const response = await request(app)
        .post('/api/implement')
        .send({
          process: {
            name: 'Test Process',
            description: 'Process description',
            table: 'incident'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.details).toContain('Milestones are required');
    });

    it('should return 202 with operation ID for valid request', async () => {
      // Setup mocks
      n8nService.triggerImplementationWorkflow.mockResolvedValue({});
      operationService.createOperation.mockImplementation(() => {});

      const response = await request(app)
        .post('/api/implement')
        .send(sampleLoanOriginationProcess);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('operation_id');
      expect(response.body).toHaveProperty('status', 'in_progress');
      expect(response.body).toHaveProperty('message', 'Implementation operation started');
      expect(response.body).toHaveProperty('timestamp');

      // Verify mocks were called
      expect(operationService.createOperation).toHaveBeenCalledTimes(1);
      expect(n8nService.triggerImplementationWorkflow).toHaveBeenCalledTimes(1);
      expect(n8nService.triggerImplementationWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          processDefinition: sampleLoanOriginationProcess
        })
      );
    });

    it('should return 502 if n8n service fails', async () => {
      // Setup mocks
      n8nService.triggerImplementationWorkflow.mockRejectedValue({
        isOperational: true,
        statusCode: 502,
        message: 'Failed to trigger implementation workflow'
      });

      const response = await request(app)
        .post('/api/implement')
        .send(sampleLoanOriginationProcess);

      expect(response.status).toBe(502);
      expect(response.body).toHaveProperty('error', 'Failed to trigger implementation workflow');
    });
  });
});