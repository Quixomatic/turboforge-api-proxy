/**
 * Callback Routes
 * Routes for handling callbacks from n8n workflows
 */

import express from 'express';
import * as callbackController from '../controllers/callbackController.js';
import { validateCallbackRequest } from '../middleware/validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/callback/research/:operationId
 * @desc    Handle research workflow callback
 * @access  Private (should only be called by n8n)
 */
router.post(
  '/research/:operationId',
  validateCallbackRequest,
  asyncHandler(callbackController.handleResearchCallback)
);

/**
 * @route   POST /api/callback/implement/:operationId
 * @desc    Handle implementation workflow callback
 * @access  Private (should only be called by n8n)
 */
router.post(
  '/implement/:operationId',
  validateCallbackRequest,
  asyncHandler(callbackController.handleImplementCallback)
);

export default router;