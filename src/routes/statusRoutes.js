/**
 * Status Routes
 * Routes for checking operation status
 */

import express from 'express';
import * as statusController from '../controllers/statusController.js';
import { validateStatusRequest } from '../middleware/validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   GET /api/status/:operationId
 * @desc    Check status of an operation
 * @access  Public
 */
router.get('/:operationId', validateStatusRequest, asyncHandler(statusController.getOperationStatus));

export default router;