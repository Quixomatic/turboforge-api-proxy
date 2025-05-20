/**
 * Validator Middleware
 * Validation middleware for API requests using Joi
 */

import Joi from 'joi';
import logger from '../utils/logger.js';

/**
 * Validates research request body against schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateResearchRequest = (req, res, next) => {
  const schema = Joi.object({
    processType: Joi.string().required().trim().min(3).max(100).messages({
      'any.required': 'Process type is required',
      'string.empty': 'Process type cannot be empty',
      'string.min': 'Process type must be at least 3 characters',
      'string.max': 'Process type must be at most 100 characters'
    }),
    industry: Joi.string().required().trim().min(3).max(100).messages({
      'any.required': 'Industry is required',
      'string.empty': 'Industry cannot be empty',
      'string.min': 'Industry must be at least 3 characters',
      'string.max': 'Industry must be at most 100 characters'
    }),
    additionalRequirements: Joi.string().allow('').optional().max(1000).messages({
      'string.max': 'Additional requirements must be at most 1000 characters'
    })
  });

  validateRequest(req, res, next, schema);
};

/**
 * Validates implementation request body against schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateImplementRequest = (req, res, next) => {
  const schema = Joi.object({
    process: Joi.object({
      name: Joi.string().required().trim().min(3).max(100).messages({
        'any.required': 'Process name is required',
        'string.empty': 'Process name cannot be empty',
        'string.min': 'Process name must be at least 3 characters',
        'string.max': 'Process name must be at most 100 characters'
      }),
      description: Joi.string().allow('').optional().max(1000).messages({
        'string.max': 'Process description must be at most 1000 characters'
      }),
      table: Joi.string().optional().default('incident').messages({
        'string.empty': 'Table name cannot be empty'
      })
    })
      .required()
      .messages({
        'any.required': 'Process definition is required'
      }),
    milestones: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().trim().min(3).max(100).messages({
            'any.required': 'Milestone name is required',
            'string.empty': 'Milestone name cannot be empty',
            'string.min': 'Milestone name must be at least 3 characters',
            'string.max': 'Milestone name must be at most 100 characters'
          }),
          short_description: Joi.string().allow('').optional().max(200).messages({
            'string.max': 'Milestone description must be at most 200 characters'
          }),
          glyph: Joi.string().allow('').optional().max(50).messages({
            'string.max': 'Glyph must be at most 50 characters'
          }),
          order: Joi.number().integer().optional().default(100).messages({
            'number.base': 'Order must be a number',
            'number.integer': 'Order must be an integer'
          }),
          steps: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required().trim().min(3).max(100).messages({
                  'any.required': 'Step name is required',
                  'string.empty': 'Step name cannot be empty',
                  'string.min': 'Step name must be at least 3 characters',
                  'string.max': 'Step name must be at most 100 characters'
                }),
                short_label: Joi.string().allow('').optional().max(50).messages({
                  'string.max': 'Short label must be at most 50 characters'
                }),
                step_type: Joi.string()
                  .optional()
                  .default('form')
                  .valid(
                    'form',
                    'confirmation',
                    'yes/no',
                    'repeater',
                    'repeater_summary',
                    'repeater_summary_with_questions',
                    'dead_end'
                  )
                  .messages({
                    'any.only': 'Step type must be a valid type'
                  }),
                display_label: Joi.string().allow('').optional().max(100).messages({
                  'string.max': 'Display label must be at most 100 characters'
                }),
                short_description: Joi.string().allow('').optional().max(200).messages({
                  'string.max': 'Step description must be at most 200 characters'
                }),
                footer_message: Joi.string().allow('').optional().max(500).messages({
                  'string.max': 'Footer message must be at most 500 characters'
                }),
                glyph: Joi.string().allow('').optional().max(50).messages({
                  'string.max': 'Glyph must be at most 50 characters'
                }),
                show_on_sidebar: Joi.boolean().optional().default(true),
                show_on_confirmation: Joi.boolean().optional().default(true),
                order: Joi.number().integer().optional().default(100).messages({
                  'number.base': 'Order must be a number',
                  'number.integer': 'Order must be an integer'
                }),
                one_time_step: Joi.boolean().optional().default(false),
                questions: Joi.array()
                  .items(
                    Joi.object({
                      name: Joi.string().required().trim().min(3).max(100).messages({
                        'any.required': 'Question name is required',
                        'string.empty': 'Question name cannot be empty',
                        'string.min': 'Question name must be at least 3 characters',
                        'string.max': 'Question name must be at most 100 characters'
                      }),
                      label: Joi.string().required().trim().min(3).max(100).messages({
                        'any.required': 'Question label is required',
                        'string.empty': 'Question label cannot be empty',
                        'string.min': 'Question label must be at least 3 characters',
                        'string.max': 'Question label must be at most 100 characters'
                      }),
                      type: Joi.string()
                        .optional()
                        .default('string')
                        .valid(
                          'string',
                          'integer',
                          'decimal',
                          'boolean',
                          'reference',
                          'choice',
                          'multiple_choice',
                          'date',
                          'datetime',
                          'container',
                          'multi_row_variable_set'
                        )
                        .messages({
                          'any.only': 'Question type must be a valid type'
                        }),
                      order: Joi.number().integer().optional().default(100).messages({
                        'number.base': 'Order must be a number',
                        'number.integer': 'Order must be an integer'
                      }),
                      mandatory: Joi.boolean().optional().default(false),
                      help_text: Joi.string().allow('').optional().max(500).messages({
                        'string.max': 'Help text must be at most 500 characters'
                      }),
                      reference: Joi.string().allow('').optional().max(100).messages({
                        'string.max': 'Reference must be at most 100 characters'
                      }),
                      reference_qual: Joi.string().allow('').optional().max(500).messages({
                        'string.max': 'Reference qualifier must be at most 500 characters'
                      }),
                      sub_type: Joi.string().allow('').optional().max(100).messages({
                        'string.max': 'Sub type must be at most 100 characters'
                      }),
                      value_field: Joi.string().allow('').optional().max(100).messages({
                        'string.max': 'Value field must be at most 100 characters'
                      }),
                      default_value: Joi.string().allow('').optional().max(200).messages({
                        'string.max': 'Default value must be at most 200 characters'
                      })
                    })
                  )
                  .optional()
                  .default([])
              })
            )
            .optional()
            .default([])
        })
      )
      .required()
      .messages({
        'any.required': 'Milestones are required'
      }),
    rules: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().trim().min(3).max(100).messages({
            'any.required': 'Rule name is required',
            'string.empty': 'Rule name cannot be empty',
            'string.min': 'Rule name must be at least 3 characters',
            'string.max': 'Rule name must be at most 100 characters'
          }),
          type: Joi.string().required().valid('process', 'milestone', 'step').messages({
            'any.required': 'Rule type is required',
            'any.only': 'Rule type must be a valid type'
          }),
          script: Joi.string().allow('').optional().max(5000).messages({
            'string.max': 'Script must be at most 5000 characters'
          }),
          message_simple: Joi.string().allow('').optional().max(500).messages({
            'string.max': 'Message must be at most 500 characters'
          })
        })
      )
      .optional()
      .default([])
  });

  validateRequest(req, res, next, schema);
};

/**
 * Validates status request parameters against schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateStatusRequest = (req, res, next) => {
  const schema = Joi.object({
    operationId: Joi.string().required().trim().guid().messages({
      'any.required': 'Operation ID is required',
      'string.empty': 'Operation ID cannot be empty',
      'string.guid': 'Operation ID must be a valid UUID'
    })
  });

  validateRequest(req, res, next, schema, 'params');
};

/**
 * Validates callback request against schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateCallbackRequest = (req, res, next) => {
  const paramsSchema = Joi.object({
    operationId: Joi.string().required().trim().guid().messages({
      'any.required': 'Operation ID is required',
      'string.empty': 'Operation ID cannot be empty',
      'string.guid': 'Operation ID must be a valid UUID'
    })
  });

  // For research callbacks, we need to validate the new structure
  const researchBodySchema = Joi.object({
    success: Joi.boolean().required(),
    result: Joi.alternatives().conditional('success', {
      is: true,
      then: Joi.object({
        operationId: Joi.string().guid(),
        researchData: Joi.object({
          timestamp: Joi.string().isoDate(),
          processType: Joi.string().required(),
          industry: Joi.string().required(),
          searchResults: Joi.array().items(
            Joi.object({
              url: Joi.string().uri(),
              title: Joi.string(),
              snippet: Joi.string(),
              authorityScore: Joi.number(),
              content: Joi.string()
            })
          )
        })
      }),
      otherwise: Joi.optional()
    }),
    error: Joi.alternatives().conditional('success', {
      is: false,
      then: Joi.string().required(),
      otherwise: Joi.optional()
    })
  });

  // For implementation callbacks, we use a different schema
  const implementBodySchema = Joi.object({
    success: Joi.boolean().required(),
    result: Joi.alternatives().conditional('success', {
      is: true,
      then: Joi.object(),
      otherwise: Joi.optional()
    }),
    error: Joi.alternatives().conditional('success', {
      is: false,
      then: Joi.string().required(),
      otherwise: Joi.optional()
    })
  });

  // First validate params
  const paramsValidation = paramsSchema.validate(req.params);
  if (paramsValidation.error) {
    logger.warn('Validation error in callback params', {
      error: paramsValidation.error.details,
      path: req.originalUrl
    });

    return res.status(400).json({
      error: 'Validation Error',
      details: paramsValidation.error.details.map(detail => detail.message),
      status: 400,
      timestamp: new Date().toISOString()
    });
  }

  // Determine which body schema to use based on the callback type
  const isResearchCallback = req.originalUrl.includes('/callback/research/');
  const bodySchema = isResearchCallback ? researchBodySchema : implementBodySchema;

  // Then validate body
  validateRequest(req, res, next, bodySchema);
};

/**
 * Helper function to validate request against schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Object} schema - Joi schema to validate against
 * @param {String} property - Request property to validate (body, params, query)
 */
const validateRequest = (req, res, next, schema, property = 'body') => {
  // Validate request against schema
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    logger.warn('Validation error', {
      error: error.details,
      path: req.originalUrl
    });

    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(detail => detail.message),
      status: 400,
      timestamp: new Date().toISOString()
    });
  }

  // Update validated values
  req[property] = value;
  next();
};
