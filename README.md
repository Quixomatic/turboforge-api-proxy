# TurboForge API Proxy

The API proxy component of the TurboForge AI Process Builder, designed to work with separately deployed n8n and Ollama services.

## Overview

This API proxy provides the necessary endpoints for integrating an AI model with n8n workflows for process research and ServiceNow implementation. It's designed to be deployed as a standalone service that connects to your existing n8n and Ollama deployments.

## Features

- `/api/research` endpoint for requesting process research
- `/api/implement` endpoint for implementing processes in ServiceNow
- `/api/status/{operation_id}` endpoint for checking operation status
- Callback handling for asynchronous operation completion
- Health check endpoint at `/health`

## Prerequisites

- Node.js 14+ installed
- Access to an n8n instance with the research and implementation workflows
- Access to an Ollama instance with the turboforge-architect model
- ServiceNow instance with TurboForge installed

## Installation

### Clone or download this repository

```bash
git clone https://github.com/your-org/turboforge-api-proxy.git
cd turboforge-api-proxy
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the example `.env` file and modify it with your actual configurations:

```bash
cp .env.example .env
# Edit .env with your service URLs and configuration
```

Key environment variables to configure:

- `N8N_URL`: URL of your n8n webhook endpoint (e.g., http://your-n8n-host:5678/webhook)
- `OLLAMA_URL`: URL of your Ollama API (e.g., http://your-ollama-host:11434/api)
- `OLLAMA_MODEL`: Name of the Ollama model to use (e.g., turboforge-architect)
- `RESEARCH_WEBHOOK`: Name of the research workflow webhook in n8n
- `IMPLEMENT_WEBHOOK`: Name of the implementation workflow webhook in n8n

## Running the API Proxy

### Using the start script

```bash
chmod +x start.sh
./start.sh
```

### Manual start

```bash
node app.js
```

### Using PM2 (for production)

```bash
npm install -g pm2
pm2 start app.js --name turboforge-api-proxy
```

## Docker Deployment

### Build the Docker image

```bash
docker build -t turboforge-api-proxy .
```

### Run the container

```bash
docker run -d \
  --name turboforge-api-proxy \
  -p 3000:3000 \
  -e N8N_URL=http://your-n8n-host:5678/webhook \
  -e OLLAMA_URL=http://your-ollama-host:11434/api \
  -e OLLAMA_MODEL=turboforge-architect \
  -e RESEARCH_WEBHOOK=process-research \
  -e IMPLEMENT_WEBHOOK=process-implementation \
  turboforge-api-proxy
```

Or using environment file:

```bash
docker run -d \
  --name turboforge-api-proxy \
  -p 3000:3000 \
  --env-file .env \
  turboforge-api-proxy
```

## API Endpoints

### Research API

```
POST /api/research
```

Request body:
```json
{
  "processType": "loan origination",
  "industry": "financial services",
  "additionalRequirements": "TRID compliance"
}
```

Response:
```json
{
  "operation_id": "12345-uuid",
  "status": "in_progress",
  "message": "Research operation started"
}
```

### Implementation API

```
POST /api/implement
```

Request body:
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
      "steps": [...]
    }
  ]
}
```

Response:
```json
{
  "operation_id": "67890-uuid",
  "status": "in_progress",
  "message": "Implementation operation started"
}
```

### Status Check API

```
GET /api/status/{operation_id}
```

Response:
```json
{
  "operation_id": "12345-uuid",
  "type": "research",
  "status": "completed",
  "result": {...},
  "timestamp": 1621234567890
}
```

## Integration with n8n

This API proxy is designed to integrate with n8n workflows. Make sure your n8n instance has the following workflows imported and activated:

1. Research workflow: Accepts process type and industry, performs research, and returns structured results
2. Implementation workflow: Accepts process definition and creates records in ServiceNow

The API proxy will call these workflows via webhooks and receive callbacks when operations are complete.

## Health Check

A simple health check endpoint is available at `/health`:

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2023-05-20T12:34:56.789Z"
}
```

## Troubleshooting

- If the API proxy cannot connect to n8n, check the N8N_URL environment variable and ensure n8n is running
- If operations never complete, verify that the n8n workflows are configured to call back to the API proxy
- Check server logs for detailed error messages

## Security Considerations

- This API proxy does not implement authentication by default
- For production deployment, consider adding API key validation or other authentication mechanisms
- Restrict access to this service to trusted networks

# TurboForge API Proxy Structure

## Directory Structure

```
turboforge-api-proxy/
├── src/                          # Source code directory
│   ├── config/                   # Configuration management
│   │   ├── index.js              # Main configuration loader
│   │   └── validator.js          # Environment variable validation
│   ├── controllers/              # Request controllers
│   │   ├── healthController.js   # Health check controller
│   │   ├── researchController.js # Research API controller
│   │   ├── implementController.js # Implementation API controller
│   │   └── statusController.js   # Status API controller
│   ├── middleware/               # Express middleware
│   │   ├── errorHandler.js       # Global error handling middleware
│   │   ├── logger.js             # Request logging middleware
│   │   └── validator.js          # Request validation middleware
│   ├── services/                 # Business logic services
│   │   ├── n8nService.js         # n8n integration service
│   │   ├── ollamaService.js      # Ollama integration service
│   │   ├── operationService.js   # Operation tracking service
│   │   └── callbackService.js    # Callback handling service
│   ├── utils/                    # Utility functions
│   │   ├── asyncHandler.js       # Async error handling utility
│   │   └── logger.js             # Logging utility
│   ├── routes/                   # API route definitions
│   │   ├── index.js              # Main router
│   │   ├── healthRoutes.js       # Health check routes
│   │   ├── researchRoutes.js     # Research API routes
│   │   ├── implementRoutes.js    # Implementation API routes
│   │   ├── statusRoutes.js       # Status API routes
│   │   └── callbackRoutes.js     # Callback routes
│   └── app.js                    # Express application setup
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── controllers/          # Controller tests
│   │   ├── services/             # Service tests
│   │   └── utils/                # Utility tests
│   ├── integration/              # Integration tests
│   │   ├── research.test.js      # Research API tests
│   │   ├── implement.test.js     # Implementation API tests
│   │   └── status.test.js        # Status API tests
│   └── mocks/                    # Test mocks and fixtures
│       ├── n8nResponses.js       # Mock n8n responses
│       └── processDefinitions.js # Sample process definitions
├── scripts/                      # Utility scripts
│   ├── start.sh                  # Start script
│   └── deploy.sh                 # Deployment script
├── docs/                         # Documentation
│   ├── api.md                    # API documentation
│   └── integration.md            # Integration guide
├── .env.example                  # Example environment variables
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git ignore file
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── jest.config.js                # Jest test configuration
├── nodemon.json                  # Nodemon configuration
├── package.json                  # NPM package configuration
├── package-lock.json             # NPM package lock
├── Dockerfile                    # Docker build configuration
├── docker-compose.yml            # Docker Compose configuration
├── README.md                     # Project documentation
└── server.js                     # Application entry point
```

## Key Files

### Core Application Files

- **server.js**: Entry point that starts the Express server
- **src/app.js**: Express application setup with middleware and routes
- **src/config/index.js**: Configuration management loading from environment variables

### API Routes

- **src/routes/index.js**: Main router that combines all route modules
- **src/routes/researchRoutes.js**: Research API endpoint routes
- **src/routes/implementRoutes.js**: Implementation API endpoint routes
- **src/routes/statusRoutes.js**: Status check API endpoint routes
- **src/routes/callbackRoutes.js**: Callback endpoint routes for n8n workflows

### Controllers

- **src/controllers/researchController.js**: Handles research API requests
- **src/controllers/implementController.js**: Handles implementation API requests
- **src/controllers/statusController.js**: Handles status check requests
- **src/controllers/healthController.js**: Handles health check requests

### Services

- **src/services/n8nService.js**: Manages communication with n8n workflows
- **src/services/ollamaService.js**: Manages communication with Ollama API
- **src/services/operationService.js**: Tracks and manages operation status
- **src/services/callbackService.js**: Processes callbacks from n8n workflows

### Utils & Middleware

- **src/utils/logger.js**: Logging utility for consistent log formatting
- **src/middleware/errorHandler.js**: Global error handling middleware
- **src/middleware/validator.js**: Request validation middleware

### Configuration

- **.env.example**: Template for environment variables
- **.env**: Actual environment variables (not committed to version control)
- **nodemon.json**: Configuration for development mode auto-restart

### Docker Files

- **Dockerfile**: Instructions for building the Docker image
- **docker-compose.yml**: Docker Compose configuration for containerized deployment

### Scripts

- **scripts/start.sh**: Bash script for starting the application
- **scripts/deploy.sh**: Deployment automation script

## Deployment Files

For deployment, the minimum required files are:

```
turboforge-api-proxy/
├── src/                          # All source code files
├── .env                          # Configured environment variables
├── package.json                  # NPM package configuration
├── package-lock.json             # NPM package lock 
└── server.js                     # Application entry point
```

For Docker deployment, you need:

```
turboforge-api-proxy/
├── src/                          # All source code files
├── .env                          # Configured environment variables
├── package.json                  # NPM package configuration
├── package-lock.json             # NPM package lock
├── Dockerfile                    # Docker build configuration
└── server.js                     # Application entry point
```