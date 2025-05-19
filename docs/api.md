# TurboForge API Proxy - Comprehensive API Documentation

This document provides a complete reference of the TurboForge API Proxy, including all endpoints, request/response formats, authentication methods, and detailed examples.

## Base URL

All API endpoints are relative to the base URL of your deployment:

```
http://your-host:3000
```

For production environments, use HTTPS:

```
https://your-host:3000
```

## Authentication

API authentication is controlled via the `ENABLE_API_KEY_AUTH` environment variable. When enabled, all API requests must include an `x-api-key` header:

```
x-api-key: your-api-key
```

Example authenticated request:

```bash
curl -X POST http://your-host:3000/api/research \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"processType": "loan origination", "industry": "financial services"}'
```

## Rate Limiting

The API implements rate limiting to protect against abuse. By default, limits are:

- 60 requests per minute per client IP or API key
- Headers provide information about current limits:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window
  - `X-RateLimit-Remaining`: Requests remaining in the current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit window resets

When rate limits are exceeded, the API returns a `429 Too Many Requests` status code:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded, please try again later",
  "status": 429,
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

## Endpoint Reference

### Health Check

#### GET /health

Check the health status of the API and its connected services.

**Request:**
No parameters required.

**Response (200 OK):**
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-05-19T12:34:56.789Z",
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "n8n": {
      "url": "http://n8n:5678/webhook",
      "status": "up"
    },
    "ollama": {
      "url": "http://ollama:11434/api",
      "model": "turboforge-architect",
      "status": "up"
    }
  }
}
```

**Response (500 Internal Server Error):**
```json
{
  "status": "error",
  "message": "Health check failed",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Example:**
```bash
curl http://your-host:3000/health
```

### Research API

#### POST /api/research

Initiates a research operation for a process design. This is an asynchronous operation that returns an operation ID for status tracking.

**Request Body:**
```json
{
  "processType": "loan origination",
  "industry": "financial services",
  "additionalRequirements": "TRID compliance"  // Optional
}
```

**Required Fields:**
- `processType`: The type of process to research (string, 3-100 characters)
- `industry`: The industry context for the process (string, 3-100 characters)

**Optional Fields:**
- `additionalRequirements`: Specific requirements or constraints (string, max 1000 characters)

**Response (202 Accepted):**
```json
{
  "operation_id": "12345-uuid",
  "status": "in_progress",
  "message": "Research operation started",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing or invalid API key (when authentication is enabled)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error
- `502 Bad Gateway`: Error communicating with n8n or Ollama

**Example:**
```bash
curl -X POST http://your-host:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "processType": "loan origination",
    "industry": "financial services",
    "additionalRequirements": "Must comply with TRID regulations and include fraud detection"
  }'
```

### Implementation API

#### POST /api/implement

Implements a process in ServiceNow TurboForge. This is an asynchronous operation that returns an operation ID for status tracking.

**Request Body:**
The request body follows a specific structure that defines all components of a TurboForge process. Below is a simplified example. For a complete schema, see the "Process Definition Schema" section.

```json
{
  "process": {
    "name": "Loan Origination Process",
    "description": "Process for originating mortgage loans following TRID requirements",
    "table": "incident"
  },
  "milestones": [
    {
      "name": "Application Intake",
      "short_description": "Collecting initial borrower information",
      "glyph": "user",
      "order": 100,
      "steps": [
        {
          "name": "Borrower Information",
          "short_label": "Borrower Info",
          "step_type": "form",
          "display_label": "Borrower Information Collection",
          "short_description": "Collect basic borrower details",
          "order": 100,
          "questions": [
            {
              "name": "borrower_name",
              "label": "Borrower Full Name",
              "type": "string",
              "order": 100,
              "mandatory": true
            },
            {
              "name": "borrower_ssn",
              "label": "Social Security Number",
              "type": "string",
              "order": 200,
              "mandatory": true
            }
          ]
        }
      ]
    }
  ],
  "rules": [
    {
      "name": "SSN Validation",
      "type": "step",
      "script": "if (!/^\\d{3}-\\d{2}-\\d{4}$/.test(inputs.borrower_ssn)) { return false; } return true;",
      "message_simple": "SSN must be in format XXX-XX-XXXX"
    }
  ]
}
```

**Response (202 Accepted):**
```json
{
  "operation_id": "67890-uuid",
  "status": "in_progress",
  "message": "Implementation operation started",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing or invalid API key (when authentication is enabled)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error
- `502 Bad Gateway`: Error communicating with n8n or ServiceNow

**Example:**
```bash
curl -X POST http://your-host:3000/api/implement \
  -H "Content-Type: application/json" \
  -d @process-definition.json
```

Where `process-definition.json` contains the complete process definition.

### Status API

#### GET /api/status/:operationId

Check the status of an asynchronous operation.

**Path Parameters:**
- `operationId`: The UUID of the operation to check

**Response (200 OK - In Progress):**
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "in_progress",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Response (200 OK - Completed Research):**
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "completed",
  "result": {
    "processType": "loan origination",
    "industry": "financial services",
    "processStructure": {
      "milestones": [
        {
          "name": "Application Intake",
          "description": "Collecting initial borrower information",
          "order": 100,
          "confidence": 0.9,
          "source": "consumerfinance.gov"
        }
      ],
      "steps": [
        {
          "name": "Borrower Information Collection",
          "milestone": "Application Intake",
          "description": "Capturing borrower personal and contact details",
          "order": 100,
          "confidence": 0.9,
          "source": "fanniemae.com"
        }
      ]
    },
    "dataRequirements": {
      "requiredFields": [
        {
          "name": "borrower_name",
          "label": "Borrower Full Name",
          "fieldType": "string",
          "required": true,
          "confidence": 0.9,
          "source": "fanniemae.com"
        }
      ]
    },
    "complianceRequirements": {
      "regulations": [
        {
          "name": "TILA-RESPA Integrated Disclosure",
          "abbreviation": "TRID",
          "description": "Federal regulation requiring specific disclosures",
          "confidence": 0.9,
          "source": "consumerfinance.gov"
        }
      ]
    },
    "metadata": {
      "serviceNowInstance": "your-instance.service-now.com",
      "timestamp": "2025-05-19T12:34:56.789Z",
      "processingTime": 15230
    }
  },
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Response (200 OK - Completed Implementation):**
```json
{
  "operation_id": "67890-uuid",
  "type": "implement",
  "status": "completed",
  "result": {
    "processId": "6a7b8c9d0e1f2g3h4i5j",
    "processName": "Loan Origination Process",
    "milestones": [
      {
        "id": "1a2b3c4d5e6f7g8h9i0j",
        "name": "Application Intake",
        "status": "created"
      }
    ],
    "stepCount": 12,
    "questionCount": 48,
    "ruleCount": 5,
    "links": {
      "admin": "https://your-instance.service-now.com/x_312987_turbofo_0_process.do?sys_id=6a7b8c9d0e1f2g3h4i5j",
      "user": "https://your-instance.service-now.com/sp?id=tf_step_form&process=6a7b8c9d0e1f2g3h4i5j",
      "processList": "https://your-instance.service-now.com/nav_to.do?uri=x_312987_turbofo_0_process_list.do"
    },
    "metadata": {
      "serviceNowInstance": "your-instance.service-now.com",
      "timestamp": "2025-05-19T12:34:56.789Z",
      "processingTime": 8760
    }
  },
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Response (200 OK - Failed):**
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "failed",
  "error": {
    "message": "Failed to complete research operation",
    "details": "Search API returned an error: Rate limit exceeded",
    "timestamp": "2025-05-19T12:34:56.789Z"
  },
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "No operation found with ID: 12345-uuid",
  "status": 404,
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Example:**
```bash
curl http://your-host:3000/api/status/12345-uuid
```

## Process Definition Schema

The full schema for the implementation API follows the TurboForge data model:

### Process Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the process (3-100 chars) |
| description | string | No | Description of the process (max 1000 chars) |
| table | string | No | Target table for the process (default: incident) |

### Milestone Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the milestone (3-100 chars) |
| short_description | string | No | Short description (max 200 chars) |
| glyph | string | No | Icon name (max 50 chars) |
| order | integer | No | Display order (default: 100) |
| steps | array | Yes | Array of Step objects |

### Step Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the step (3-100 chars) |
| short_label | string | No | Short label for sidebar (max 50 chars) |
| step_type | string | No | Type of step (default: form) |
| display_label | string | No | Display label (max 100 chars) |
| short_description | string | No | Short description (max 200 chars) |
| footer_message | string | No | Footer message (max 500 chars) |
| glyph | string | No | Icon name (max 50 chars) |
| show_on_sidebar | boolean | No | Whether to show on sidebar (default: true) |
| show_on_confirmation | boolean | No | Whether to show on confirmation (default: true) |
| order | integer | No | Display order (default: 100) |
| one_time_step | boolean | No | Whether this is a one-time step (default: false) |
| questions | array | No | Array of Question objects |

### Question Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the question (3-100 chars) |
| label | string | Yes | Label for the question (3-100 chars) |
| type | string | No | Question type (default: string) |
| order | integer | No | Display order (default: 100) |
| mandatory | boolean | No | Whether question is required (default: false) |
| help_text | string | No | Help text (max 500 chars) |
| reference | string | No | Reference table name for reference type |
| reference_qual | string | No | Reference qualifier for reference type |
| sub_type | string | No | Sub-type for specialized question types |
| value_field | string | No | Value field for reference types |
| default_value | string | No | Default value (max 200 chars) |

### Rule Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Name of the rule (3-100 chars) |
| type | string | Yes | Rule type (process, milestone, or step) |
| script | string | No | Validation script (max 5000 chars) |
| message_simple | string | No | Error message (max 500 chars) |

## Error Handling

The API follows consistent error patterns across all endpoints:

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "status": 400,
  "timestamp": "2025-05-19T12:34:56.789Z",
  "details": ["Optional array of specific error details"]
}
```

### Common Error Status Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Validation Error | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Error communicating with external services |
| 503 | Service Unavailable | Dependent service is down |

### Validation Error Example

```json
{
  "error": "Validation Error",
  "details": [
    "Process type is required",
    "Industry must be at least 3 characters"
  ],
  "status": 400,
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

## End-to-End Example: Creating a Process

This example demonstrates a complete workflow for creating a process using the API Proxy:

### 1. Initiate Research

```bash
curl -X POST http://your-host:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "processType": "loan origination",
    "industry": "financial services",
    "additionalRequirements": "Must comply with TRID regulations"
  }'
```

Response:
```json
{
  "operation_id": "12345-uuid",
  "status": "in_progress",
  "message": "Research operation started",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

### 2. Check Research Status

```bash
curl http://your-host:3000/api/status/12345-uuid
```

Response (when completed):
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "completed",
  "result": {
    "processType": "loan origination",
    "industry": "financial services",
    "processStructure": {
      "milestones": [
        {
          "name": "Application Intake",
          "description": "Collecting initial borrower information",
          "order": 100,
          "confidence": 0.9,
          "source": "consumerfinance.gov"
        }
      ],
      "steps": [
        {
          "name": "Borrower Information Collection",
          "milestone": "Application Intake",
          "description": "Capturing borrower personal and contact details",
          "order": 100,
          "confidence": 0.9,
          "source": "fanniemae.com"
        }
      ]
    },
    "dataRequirements": {
      "requiredFields": [
        {
          "name": "borrower_name",
          "label": "Borrower Full Name",
          "fieldType": "string",
          "required": true,
          "confidence": 0.9,
          "source": "fanniemae.com"
        }
      ]
    }
  },
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

### 3. Implement Process

Using the research results, create a process definition and implement it:

```bash
curl -X POST http://your-host:3000/api/implement \
  -H "Content-Type: application/json" \
  -d '{
    "process": {
      "name": "Loan Origination Process",
      "description": "Process for originating mortgage loans following TRID requirements",
      "table": "incident"
    },
    "milestones": [
      {
        "name": "Application Intake",
        "short_description": "Collecting initial borrower information",
        "glyph": "user",
        "order": 100,
        "steps": [
          {
            "name": "Borrower Information",
            "short_label": "Borrower Info",
            "step_type": "form",
            "display_label": "Borrower Information Collection",
            "short_description": "Collect basic borrower details",
            "order": 100,
            "questions": [
              {
                "name": "borrower_name",
                "label": "Borrower Full Name",
                "type": "string",
                "order": 100,
                "mandatory": true
              }
            ]
          }
        ]
      }
    ]
  }'
```

Response:
```json
{
  "operation_id": "67890-uuid",
  "status": "in_progress",
  "message": "Implementation operation started",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

### 4. Check Implementation Status

```bash
curl http://your-host:3000/api/status/67890-uuid
```

Response (when completed):
```json
{
  "operation_id": "67890-uuid",
  "type": "implement",
  "status": "completed",
  "result": {
    "processId": "6a7b8c9d0e1f2g3h4i5j",
    "processName": "Loan Origination Process",
    "milestones": [
      {
        "id": "1a2b3c4d5e6f7g8h9i0j",
        "name": "Application Intake",
        "status": "created"
      }
    ],
    "stepCount": 1,
    "questionCount": 1,
    "ruleCount": 0,
    "links": {
      "admin": "https://your-instance.service-now.com/x_312987_turbofo_0_process.do?sys_id=6a7b8c9d0e1f2g3h4i5j",
      "user": "https://your-instance.service-now.com/sp?id=tf_step_form&process=6a7b8c9d0e1f2g3h4i5j"
    }
  },
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

The process is now created in ServiceNow TurboForge and can be accessed via the provided links.