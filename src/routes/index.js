/**
 * Routes Index
 * Combines all route modules
 */

import express from 'express';
import healthRoutes from './healthRoutes.js';
import researchRoutes from './researchRoutes.js';
import implementRoutes from './implementRoutes.js';
import statusRoutes from './statusRoutes.js';
import callbackRoutes from './callbackRoutes.js';

const router = express.Router();

// Apply route modules
router.use('/health', healthRoutes);
router.use('/api/research', researchRoutes);
router.use('/api/implement', implementRoutes);
router.use('/api/status', statusRoutes);
router.use('/api/callback', callbackRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource at ${req.originalUrl} was not found`
  });
});

export default router;