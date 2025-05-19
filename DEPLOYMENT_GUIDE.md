# TurboForge AI Process Builder - Standalone Deployment Guide

This guide walks through setting up the TurboForge AI Process Builder with separately deployed components.

## System Architecture

In this configuration, the components are deployed separately:

1. **Ollama** - Runs on its own host, providing the AI model
2. **n8n** - Runs on its own host, handling workflow automation
3. **API Proxy** - Standalone service connecting the AI model to n8n workflows

This approach offers greater flexibility in resource allocation and scaling each component independently.

## Prerequisites

- Node.js 14+ for the API Proxy
- Separate hosts for Ollama and n8n (or existing deployments)
- ServiceNow instance with TurboForge installed
- ServiceNow credentials with API access
- Search API credentials (for the research workflow)

## Component Setup

### 1. Ollama Setup

#### Install Ollama

Follow the official installation instructions for your platform:
https://github.com/ollama/ollama

Example for Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Create the TurboForge Architect Model

1. Create a file named `turboforge-architect.modelfile` with the content from [turboforge-architect-modelfile.txt](../ollama/turboforge-architect.modelfile)

2. Create the model:
```bash
ollama create turboforge-architect -f turboforge-architect.modelfile
```

3. Start Ollama:
```bash
ollama serve
```

Note the IP address or hostname of your Ollama host, as you'll need it for the API Proxy configuration.

### 2. n8n Setup

#### Install n8n

Follow the official installation instructions:
https://docs.n8n.io/hosting/installation/

Example for quick setup:
```bash
npm install n8n -g
n8n start
```

#### Import and Configure Workflows

1. Access the n8n web interface (default: http://localhost:5678)

2. Add credentials:
   - ServiceNow OAuth2 API (for the implementation workflow)
   - HTTP Header Auth for Search API (for the research workflow)

3. Import the workflows:
   - Import [research-workflow.json](../n8n/workflows/research-workflow.json)
   - Import [implementation-workflow.json](../n8n/workflows/implementation-workflow.json)

4. Activate the workflows

Note the IP address or hostname of your n8n host, as you'll need it for the API Proxy configuration.

### 3. API Proxy Setup

#### Install API Proxy

1. Download the API Proxy files:
   - [app.js](../api-proxy/app.js)
   - [package.json](../api-proxy/package.json)
   - [start.sh](../api-proxy/start.sh)
   - [.env.example](../api-proxy/.env.example)

2. Install dependencies:
```bash
npm install
```

#### Configure Environment

1. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your deployment details:
```
# API Proxy Configuration
PORT=3000

# n8n Connection
N8N_URL=http://your-n8n-host:5678/webhook
RESEARCH_WEBHOOK=process-research
IMPLEMENT_WEBHOOK=process-implementation

# Ollama Connection
OLLAMA_URL=http://your-ollama-host:11434/api
OLLAMA_MODEL=turboforge-architect

# ServiceNow Configuration (for building links)
SERVICENOW_INSTANCE=your-instance.service-now.com
```

Replace `your-n8n-host` and `your-ollama-host` with the actual IP addresses or hostnames of your n8n and Ollama deployments.

#### Start the API Proxy

```bash
chmod +x start.sh
./start.sh
```

For production use, consider using PM2:
```bash
npm install -g pm2
pm2 start app.js --name turboforge-api-proxy
```

### 4. ServiceNow Configuration

1. Ensure TurboForge is installed and properly configured in your ServiceNow instance
2. Create a dedicated ServiceNow user for API access
3. Configure the appropriate roles:
   - x_312987_turbofo_0.admin
   - admin (or more restricted if desired)

## Testing the System

### Test API Proxy Connectivity

1. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

2. Test research API:
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"processType": "loan origination", "industry": "financial services"}'
```

3. Check the operation status:
```bash
curl http://localhost:3000/api/status/{operation_id}
```

### Test Ollama Model

```bash
ollama run turboforge-architect
```

Example interaction:
```
USER: Create a loan origination process for our mortgage company that follows TRID requirements.

AI: [Response from the AI model]
```

## Advanced Configuration

### API Proxy with HTTPS

For production deployments, it's recommended to run the API proxy with HTTPS. You can:

1. Use a reverse proxy like Nginx:
```
server {
    listen 443 ssl;
    server_name api-proxy.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. Or implement HTTPS directly in the Node.js application by modifying app.js

### API Proxy Authentication

Add API key validation to the API proxy for better security:

1. Add to .env:
```
API_KEY=your-secure-api-key
```

2. Implement authentication middleware in app.js:
```javascript
// Authentication middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }
  next();
});
```

### Ollama with Docker

For containerized deployment of Ollama:

```bash
docker run -d --name ollama \
  -p 11434:11434 \
  -v ollama-models:/root/.ollama \
  ollama/ollama

# Create the model
docker exec -it ollama ollama create turboforge-architect -f /path/to/turboforge-architect.modelfile
```

### n8n with Docker

For containerized deployment of n8n:

```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n-data:/home/node/.n8n \
  -e N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN=true \
  n8nio/n8n
```

## Troubleshooting

### API Proxy Connectivity Issues

Check network connectivity between components:
```bash
# Test connectivity to n8n
curl -v http://your-n8n-host:5678/

# Test connectivity to Ollama
curl -v http://your-ollama-host:11434/api/version
```

### Operation Status Issues

If operations never complete:
1. Verify n8n workflows are configured to call back to the API proxy
2. Check n8n execution history for errors
3. Ensure the callback URL is accessible from the n8n host

### ServiceNow Integration Issues

1. Verify API credentials and permissions
2. Test direct API access to ServiceNow
3. Check implementation workflow execution logs in n8n

## Maintenance

### API Proxy Updates

When updating the API proxy:
```bash
# Stop the service
pm2 stop turboforge-api-proxy

# Pull the latest code
git pull

# Install any new dependencies
npm install

# Start the service
pm2 start turboforge-api-proxy
```

### Ollama Model Updates

When updating the AI model:
```bash
# Update the modelfile
vi turboforge-architect.modelfile

# Recreate the model with the force flag
ollama create turboforge-architect -f turboforge-architect.modelfile --force
```

### n8n Workflow Updates

1. Export existing workflows as backup
2. Import updated workflow files
3. Reconfigure credentials if needed
4. Test with sample requests

## Security Best Practices

1. Run all components behind a firewall
2. Use HTTPS for all communications
3. Implement API authentication
4. Use dedicated service accounts with minimal permissions
5. Regularly rotate credentials
6. Monitor logs for suspicious activity

## Resource Monitoring

### API Proxy Monitoring

Monitor the Node.js process:
```bash
pm2 monit
```

### Ollama Monitoring

Monitor Ollama resources:
```bash
# Check memory usage
ps -o pid,user,%mem,command ax | grep ollama

# Check GPU usage (if applicable)
nvidia-smi
```

### n8n Monitoring

Monitor execution history in the n8n web interface:
http://your-n8n-host:5678/workflow/executions

## Scaling Considerations

### API Proxy Scaling

For high availability:
1. Deploy multiple instances behind a load balancer
2. Use a shared database for operation status tracking (replace in-memory storage)

### Ollama Scaling

For higher performance:
1. Use more powerful GPU(s)
2. Consider multiple Ollama instances with load balancing

### n8n Scaling

For higher throughput:
1. Enable the queue mode for handling more concurrent executions
2. Use a dedicated database for n8n instead of SQLite