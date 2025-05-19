# TurboForge API Proxy - API Documentation

This document provides detailed information about the API endpoints exposed by the TurboForge API Proxy.

## Base URL

All API endpoints are relative to the base URL of your deployment:

```
http://your-host:3000
```

## Authentication

API authentication is optional and can be enabled by setting `ENABLE_API_KEY_AUTH=true` in your environment configuration.

When enabled, all API requests must include an `x-api-key` header with the configured API key:

```
x-api-key: your-api-key
```

## Rate Limiting

The API implements rate limiting to protect against abuse. By default, limits are:

- 60 requests per minute per client IP or API key
- Headers provide information about current limits:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window
  - `X-RateLimit-Remaining`: Requests remaining in the current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit window resets

## Common Response Formats

All API responses use JSON and include the following common fields:

### Success Response

```json
{
  "status": 200,
  "message": "Request processed successfully",
  "timestamp": "2025-05-19T12:34:56.789Z",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error Type",
  "message": "Description of the error",
  "status": 400,
  "timestamp": "2025-05-19T12:34:56.789Z",
  "details": [ ... ]  // Optional array of detailed error messages
}
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the API.

**Request**:
No parameters required.

**Response**:
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

### Research API

#### POST /api/research

Initiates a research operation for a process.

**Request**:
```json
{
  "processType": "loan origination",
  "industry": "financial services",
  "additionalRequirements": "TRID compliance"  // Optional
}
```

**Response**:
```json
{
  "operation_id": "12345-uuid",
  "status": "in_progress",
  "message": "Research operation started",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

### Implementation API

#### POST /api/implement

Implements a process in ServiceNow.

**Request**:
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
      "order": 100,
      "steps": [
        {
          "name": "Borrower Information",
          "step_type": "form",
          "questions": [
            {
              "name": "borrower_name",
              "label": "Borrower Full Name",
              "type": "string",
              "mandatory": true
            }
          ]
        }
      ]
    }
  ]
}
```

**Response**:
```json
{
  "operation_id": "67890-uuid",
  "status": "in_progress",
  "message": "Implementation operation started",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

### Status API

#### GET /api/status/:operationId

Check the status of an operation.

**Request**:
Path parameter: `operationId` - The UUID of the operation to check

**Response (In Progress)**:
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "in_progress",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Response (Completed)**:
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "completed",
  "result": { ... },  // Operation result
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

**Response (Failed)**:
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "failed",
  "error": "Error description",
  "timestamp": "2025-05-19T12:34:56.789Z"
}
```

## Callback Endpoints

The following endpoints are used internally by n8n workflows and are not intended for direct client use:

### POST /api/callback/research/:operationId

Handles callbacks from research workflows.

### POST /api/callback/implement/:operationId

Handles callbacks from implementation workflows.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Missing or invalid API key |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Unexpected server error |
| 502 | Bad Gateway - Error communicating with n8n or ServiceNow |
| 503 | Service Unavailable - Dependent service is down |