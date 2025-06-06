/**
 * Implementation Routes
 * Routes for the implementation API
 */

import express from 'express';
import * as implementController from '../controllers/implementController.js';
import { validateImplementRequest } from '../middleware/validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/implement
 * @desc    Implement process in ServiceNow
 * @access  Public
 */
router.post('/', validateImplementRequest, asyncHandler(implementController.initiateImplementation));

export default router;