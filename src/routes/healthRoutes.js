/**
 * Health Routes
 * Routes for health checks
 */

import express from 'express';
import * as healthController from '../controllers/healthController.js';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Check API health
 * @access  Public
 */
router.get('/', healthController.checkHealth);

export default router;