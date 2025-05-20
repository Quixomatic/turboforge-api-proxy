// src/routes/chatRoutes.js
import express from 'express';
import * as chatController from '../controllers/chatController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Send a chat message to Ollama (non-streaming)
 * @access  Public
 */
router.post('/', asyncHandler(chatController.sendChatMessage));

/**
 * @route   POST /api/chat/stream
 * @desc    Stream a chat message from Ollama
 * @access  Public
 */
router.post('/stream', chatController.streamChatMessage); // Note: don't use asyncHandler for streaming

export default router;