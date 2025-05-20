/**
 * Ollama Service
 * Handles communication with Ollama API for AI model interaction
 */

import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class OllamaService {
  constructor() {
    this.ollamaUrl = config.ollamaUrl;
    this.ollamaModel = config.ollamaModel;

    // Ensure URL does not end with a slash
    if (this.ollamaUrl.endsWith('/')) {
      this.ollamaUrl = this.ollamaUrl.slice(0, -1);
    }

    logger.info(
      `Initialized Ollama service with URL: ${this.ollamaUrl} and model: ${this.ollamaModel}`
    );
  }

  /**
   * Checks if the Ollama API is available
   * @returns {Promise<boolean>} - True if API is available, false otherwise
   */
  async checkAvailability() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/version`);
      return response.status === 200;
    } catch (error) {
      logger.error('Error checking Ollama availability:', error);
      return false;
    }
  }

  /**
   * Generates text using the Ollama model
   * @param {string} prompt - The prompt for text generation
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - The generated text
   */
  async generateText(prompt, options = {}) {
    try {
      const defaultOptions = {
        temperature: 0.2,
        max_tokens: 2048,
        top_p: 0.9,
        stop: ['</answer>']
      };

      const requestOptions = {
        ...defaultOptions,
        ...options
      };

      logger.debug('Generating text with Ollama', {
        model: this.ollamaModel,
        promptLength: prompt.length,
        options: requestOptions
      });

      const response = await axios.post(`${this.ollamaUrl}/generate`, {
        model: this.ollamaModel,
        prompt,
        options: requestOptions
      });

      logger.debug('Ollama generation successful', {
        model: this.ollamaModel,
        responseLength: response.data.response.length
      });

      return response.data.response;
    } catch (error) {
      logger.error('Error generating text with Ollama:', error);

      throw {
        isOperational: true,
        statusCode: 502,
        message: 'Failed to generate text with AI model',
        originalError: error.message
      };
    }
  }

  /**
   * Performs chat completion with the Ollama model
   * @param {Array<Object>} messages - Array of chat messages
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The chat completion response
   */
  async chatCompletion(messages, options = {}) {
    try {
      const defaultOptions = {
        temperature: 0.2,
        num_predict: 2048,
        top_p: 0.9,
        stop: ['</answer>']
      };

      const requestOptions = {
        ...defaultOptions,
        ...options
      };

      logger.debug('Performing chat completion with Ollama', {
        model: this.ollamaModel,
        messageCount: messages.length,
        options: requestOptions
      });

      const response = await axios.post(`${this.ollamaUrl}/chat`, {
        model: this.ollamaModel,
        messages,
        options: requestOptions
      });

      logger.debug('Ollama chat completion successful', {
        model: this.ollamaModel
        //responseLength: response.data.message.content.length
      });

      return response.data;
    } catch (error) {
      logger.error('Error performing chat completion with Ollama:', error);

      throw {
        isOperational: true,
        statusCode: 502,
        message: 'Failed to perform chat completion with AI model',
        originalError: error.message
      };
    }
  }

  /**
   * Performs streaming chat completion with the Ollama model
   * @param {Array<Object>} messages - Array of chat messages
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The streaming response
   */
  async streamChatCompletion(messages, options = {}) {
    try {
      const defaultOptions = {
        temperature: 0.2,
        num_predict: 2048,
        top_p: 0.9,
        stop: ['</answer>']
      };

      const requestOptions = {
        ...defaultOptions,
        ...options
      };

      logger.debug('Starting streaming chat completion with Ollama', {
        model: this.ollamaModel,
        messageCount: messages.length,
        options: requestOptions
      });

      // Request streaming response from Ollama
      const response = await axios({
        method: 'post',
        url: `${this.ollamaUrl}/chat`,
        data: {
          model: this.ollamaModel,
          messages,
          stream: true,
          options: requestOptions
        },
        responseType: 'stream'
      });

      logger.debug('Ollama streaming chat completion initiated successfully');

      return response;
    } catch (error) {
      logger.error('Error starting streaming chat completion with Ollama:', error);

      throw {
        isOperational: true,
        statusCode: 502,
        message: 'Failed to start streaming chat completion with AI model',
        originalError: error.message
      };
    }
  }

  /**
   * Lists available models from Ollama
   * @returns {Promise<Array>} - List of available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/tags`);
      return response.data.models;
    } catch (error) {
      logger.error('Error listing Ollama models:', error);

      throw {
        isOperational: true,
        statusCode: 502,
        message: 'Failed to list AI models',
        originalError: error.message
      };
    }
  }

  /**
   * Checks if a specific model is available
   * @param {string} modelName - Name of the model to check
   * @returns {Promise<boolean>} - True if model is available, false otherwise
   */
  async isModelAvailable(modelName = null) {
    try {
      const targetModel = modelName || this.ollamaModel;
      const models = await this.listModels();

      return models.some(model => model.name === targetModel);
    } catch (error) {
      logger.error(`Error checking availability of model ${modelName || this.ollamaModel}:`, error);
      return false;
    }
  }
}

// Export a singleton instance
export default new OllamaService();
