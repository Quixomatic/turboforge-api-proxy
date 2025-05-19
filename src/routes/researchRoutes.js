/**
 * Research Routes
 * Routes for the research API
 */

import express from 'express';
import * as researchController from '../controllers/researchController.js';
import { validateResearchRequest } from '../middleware/validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/research
 * @desc    Initiate research for process creation
 * @access  Public
 */
router.post('/', validateResearchRequest, asyncHandler(researchController.initiateResearch));

export default router;