// src/controllers/chatController.js
import ollamaService from '../services/ollamaService.js';
import logger from '../utils/logger.js';

export const sendChatMessage = async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Messages array is required',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Processing chat message', {
      modelName: model || 'default',
      messageCount: messages.length
    });

    // Format messages for Ollama
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get response from Ollama
    const response = await ollamaService.chatCompletion(formattedMessages);

    // Check if response has content before using it
    const responseContent =
      response.message && response.message.content
        ? response.message.content
        : response.content || "I apologize, but I couldn't generate a response.";

    // Return response in a format compatible with Anthropic SDK
    res.status(200).json({
      id: `msg_${Date.now()}`,
      model: model || ollamaService.ollamaModel,
      created_at: Date.now(),
      content: [
        {
          type: 'text',
          text: responseContent
        }
      ],
      role: 'assistant'
    });
  } catch (error) {
    logger.error('Error processing chat message:', error);

    if (error.isOperational) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        status: error.statusCode || 500,
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your message',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Streams a chat message response from Ollama
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const streamChatMessage = async (req, res) => {
  try {
    const { messages, model, options } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Messages array is required',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Processing streaming chat message', {
      modelName: model || 'default',
      messageCount: messages.length
    });

    // Format messages for Ollama
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Initialize with a "start" event
    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        id: `msg_${Date.now()}`,
        model: model || ollamaService.ollamaModel,
        created_at: Date.now()
      })}\n\n`
    );

    // Get streaming response from Ollama
    const streamResponse = await ollamaService.streamChatCompletion(formattedMessages, options);

    // Track the full content for final message
    let fullContent = '';

    // Parse JSON chunks from the stream
    const parser = chunk => {
      try {
        const data = JSON.parse(chunk.toString());

        // Only send content chunks to the client
        if (data.message && data.message.content) {
          // Add to full content
          fullContent += data.message.content;

          // Send the content chunk to the client
          res.write(
            `data: ${JSON.stringify({
              type: 'content_chunk',
              content: data.message.content,
              done: false
            })}\n\n`
          );
        }

        // If this is the final chunk, send completion message
        if (data.done) {
          res.write(
            `data: ${JSON.stringify({
              type: 'end',
              done: true,
              full_content: fullContent,
              total_duration: data.total_duration,
              eval_count: data.eval_count
            })}\n\n`
          );

          res.end();
        }
      } catch (e) {
        logger.error('Error parsing chunk:', e, { chunk: chunk.toString() });
      }
    };

    // Process the streaming response
    streamResponse.data.on('data', parser);

    // Handle stream completion
    streamResponse.data.on('end', () => {
      // In case we didn't get a proper "done" message
      if (fullContent) {
        res.write(
          `data: ${JSON.stringify({
            type: 'end',
            done: true,
            full_content: fullContent
          })}\n\n`
        );
      }
      res.end();
    });

    // Handle stream errors
    streamResponse.data.on('error', error => {
      logger.error('Stream error:', error);

      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: 'Stream error occurred',
          done: true
        })}\n\n`
      );

      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      logger.debug('Client disconnected from stream');
      // Could potentially send a signal to Ollama to stop generation
    });
  } catch (error) {
    logger.error('Error processing streaming chat message:', error);

    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      if (error.isOperational) {
        return res.status(error.statusCode || 500).json({
          error: error.message,
          status: error.statusCode || 500,
          timestamp: new Date().toISOString()
        });
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your message',
        status: 500,
        timestamp: new Date().toISOString()
      });
    } else {
      // If headers were already sent, send error as SSE event
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: error.isOperational ? error.message : 'Internal Server Error',
          done: true
        })}\n\n`
      );

      res.end();
    }
  }
};
