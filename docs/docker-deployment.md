# Docker Installation Guide for TurboForge API Proxy

This guide provides step-by-step instructions for deploying the TurboForge API Proxy using Docker and Docker Compose. This approach simplifies deployment by packaging the API Proxy along with its dependencies (n8n and Ollama) in containers.

## Prerequisites

- Docker Engine 20.10.0 or newer
- Docker Compose 2.0.0 or newer
- 8GB RAM minimum (16GB recommended, especially for Ollama)
- 20GB free disk space
- Internet connectivity for pulling Docker images

## Directory Structure Setup

Create the following directory structure for your deployment:

```
turboforge-deployment/
├── .env                          # Environment variables
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # API Proxy Dockerfile
├── logs/                         # Directory for logs
├── n8n/                          # n8n related files
│   └── workflows/                # n8n workflows
├── ollama/                       # Ollama related files
│   └── turboforge-architect.modelfile  # Ollama model definition
└── scripts/                      # Helper scripts
    └── docker-entrypoint.sh      # Docker entrypoint script
```

## Step 1: Create Environment File

Create a `.env` file with your configuration values:

```
# ServiceNow Configuration
SERVICENOW_INSTANCE=your-instance.service-now.com

# API Security (Optional)
API_KEY=your-secure-api-key
ENABLE_API_KEY_AUTH=false

# n8n Configuration (Optional)
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_BASIC_AUTH_ACTIVE=false
N8N_BASIC_AUTH_USER=
N8N_BASIC_AUTH_PASSWORD=

# External URL (for callbacks)
API_BASE_URL=http://localhost:3000
```

## Step 2: Prepare Ollama Model Definition

Create the `ollama/turboforge-architect.modelfile` file with the model definition:

```
FROM llama3:8b-instruct-q4_K_M

PARAMETER num_ctx 8192
PARAMETER temperature 0.2
PARAMETER repeat_penalty 1.1
PARAMETER stop "<|endoftext|>"

SYSTEM """
You are TurboForge Architect, an AI specialized in designing and implementing multi-step processes in TurboForge, a ServiceNow application...
"""
```

Note: Use the complete model definition from your existing files.

## Step 3: Start the Containers

Launch the entire stack using Docker Compose:

```bash
docker-compose up -d
```

This command will:
1. Build the API Proxy container
2. Pull the n8n and Ollama images
3. Start all services in the background
4. Configure networking between containers
5. Set up persistent storage volumes

## Step 4: Verify Installation

Check that all services are running properly:

```bash
docker-compose ps
```

You should see all three services (api-proxy, n8n, ollama) in the "Up" state.

### Access Points:

- **API Proxy**: http://localhost:3000
- **n8n Dashboard**: http://localhost:5678
- **Ollama API**: http://localhost:11434

## Step 5: Import n8n Workflows

1. Access the n8n dashboard at http://localhost:5678
2. Go to Workflows > Import from File
3. Import the research and implementation workflow files

## Step 6: Test the API Proxy

Check if the API Proxy is responding correctly:

```bash
curl http://localhost:3000/health
```

You should receive a JSON response with status "ok" and service information.

## Additional Operations

### Viewing Logs

View logs from the API Proxy:

```bash
docker-compose logs -f api-proxy
```

### Restarting Services

Restart a specific service:

```bash
docker-compose restart api-proxy
```

### Stopping the Stack

Stop all services:

```bash
docker-compose down
```

To stop and remove volumes (caution - this deletes all data):

```bash
docker-compose down -v
```

## Troubleshooting

### API Proxy Cannot Connect to n8n

If you see connection errors in the API Proxy logs:

```bash
docker-compose logs api-proxy | grep "n8n"
```

Ensure n8n is running and the N8N_URL environment variable is correct.

### Ollama Model Not Loading

If the Ollama model fails to load:

1. Check Ollama logs:
   ```bash
   docker-compose logs ollama
   ```

2. Manually create the model:
   ```bash
   docker-compose exec ollama ollama create turboforge-architect -f /ollama-files/turboforge-architect.modelfile
   ```

### Container Resource Issues

If containers are crashing due to resource constraints:

1. Increase Docker's resource allocation in Docker Desktop settings
2. For production, ensure your host has adequate CPU, memory, and disk space

## Production Deployment Considerations

For production deployments:

1. **Enable API Key Authentication**:
   - Set `ENABLE_API_KEY_AUTH=true` in `.env`
   - Set a strong `API_KEY` value

2. **Configure HTTPS**:
   - Use a reverse proxy (Nginx, Traefik) in front of the containers
   - Set up SSL certificates for secure communication
   - Update `API_BASE_URL` to use https

3. **Persistent Storage**:
   - Map volumes to reliable storage locations
   - Consider backup strategies for important data

4. **Monitoring**:
   - Set up container health checks
   - Implement log aggregation
   - Configure alerts for service disruptions