# TurboForge API Proxy - Integration Guide

This guide explains how to integrate the TurboForge API Proxy with n8n workflows and ServiceNow.

## Overview

The TurboForge API Proxy serves as a bridge between:

1. An AI model (via Ollama) for process design
2. n8n workflows for research and implementation
3. ServiceNow TurboForge for process execution

This guide focuses on setting up and configuring the n8n workflows and ServiceNow connections.

## n8n Workflow Integration

### Prerequisites

1. n8n server running and accessible to the API Proxy
2. ServiceNow instance with TurboForge installed
3. Web search API credentials (for research workflow)

### Importing Workflows

1. Download the workflow JSON files:
   - [research-workflow.json](https://github.com/your-org/turboforge-api-proxy/tree/main/n8n/workflows/research-workflow.json)
   - [implementation-workflow.json](https://github.com/your-org/turboforge-api-proxy/tree/main/n8n/workflows/implementation-workflow.json)

2. In the n8n web interface, go to **Workflows** and click **Import from file**

3. Select each workflow JSON file to import them

### Configuring Credentials

#### ServiceNow Credentials

1. In n8n, go to **Settings** > **Credentials**
2. Click **Add Credential**
3. Select **ServiceNow OAuth2 API**
4. Configure the following:
   - **Credential Name**: ServiceNow TurboForge
   - **Environment**: Select your ServiceNow environment
   - **Instance URL**: Your ServiceNow instance URL (e.g., https://yourinstance.service-now.com)
   - **Username**: ServiceNow API user
   - **Password**: ServiceNow API password
   - **Client ID**: Your OAuth2 client ID
   - **Client Secret**: Your OAuth2 client secret
5. Click **Create**

#### Search API Credentials

1. In n8n, go to **Settings** > **Credentials**
2. Click **Add Credential**
3. Select **HTTP Header Auth**
4. Configure the following:
   - **Credential Name**: Search API
   - **Authorization Key**: Choose the appropriate header name (e.g., "x-api-key")
   - **Authorization Value**: Your search API key
5. Click **Create**

### Customizing Research Workflow

The research workflow should be customized to:

1. Receive research requests from the API Proxy
2. Perform web searches using the Search API
3. Process and structure the research results
4. Send the results back to the API Proxy via callback

Key nodes to customize:

- **Webhook node**: Ensure the webhook path matches the configuration in your API Proxy
- **HTTP Request nodes**: Update search API endpoints and parameters as needed
- **Function nodes**: Adjust data processing to match your specific needs
- **HTTP Request (Callback)**: Ensure it's configured to call back to your API Proxy

### Customizing Implementation Workflow

The implementation workflow should be customized to:

1. Receive implementation requests from the API Proxy
2. Create all necessary records in ServiceNow TurboForge
3. Handle error recovery for failed implementations
4. Send the results back to the API Proxy via callback

Key nodes to customize:

- **Webhook node**: Ensure the webhook path matches the configuration in your API Proxy
- **ServiceNow nodes**: Update table names if your TurboForge installation uses custom table prefixes
- **Function nodes**: Adjust data processing as needed for your environment
- **HTTP Request (Callback)**: Ensure it's configured to call back to your API Proxy

## ServiceNow Integration

### Prerequisites

1. ServiceNow instance with TurboForge installed
2. User account with appropriate permissions for TurboForge management

### Creating a ServiceNow API User

1. In ServiceNow, navigate to **User Administration** > **Users**
2. Click **New**
3. Fill in the required fields:
   - **User ID**: turboforge_api
   - **First Name**: TurboForge
   - **Last Name**: API
   - **Email**: appropriate email
   - **Password**: Secure password
4. Assign the following roles:
   - x_312987_turbofo_0.admin
   - admin (or more restricted role if desired)
5. Click **Submit**

### Setting Up OAuth2 for ServiceNow (Optional)

For more secure authentication:

1. Navigate to **System OAuth** > **Application Registry**
2. Click **New**
3. Select **Create an OAuth API endpoint for external clients**
4. Fill in the required fields:
   - **Name**: TurboForge API
   - **Client ID**: Generate or specify a client ID
   - **Client Secret**: Generate a secure client secret
   - **Redirect URL**: Not needed for this integration
5. For **Access Token Lifespan**, set to appropriate duration (e.g., 86400 seconds)
6. Click **Submit**
7. Note the Client ID and Client Secret for use in n8n credentials

## API Proxy Configuration

Update your API Proxy's environment configuration to match your integration settings:

```
# n8n Configuration
N8N_URL=http://your-n8n-host:5678/webhook
RESEARCH_WEBHOOK=process-research
IMPLEMENT_WEBHOOK=process-implementation

# ServiceNow Configuration (for building links)
SERVICENOW_INSTANCE=your-instance.service-now.com
```

## Testing the Integration

1. Start the API Proxy using the `start.sh` script
2. Activate the n8n workflows
3. Send a test research request:

```bash
curl -X POST http://your-api-proxy:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "processType": "loan origination",
    "industry": "financial services",
    "additionalRequirements": "TRID compliance"
  }'
```

4. Get the operation status using the returned operation ID:

```bash
curl http://your-api-proxy:3000/api/status/{operation_id}
```

5. Once research is complete, test the implementation:

```bash
curl -X POST http://your-api-proxy:3000/api/implement \
  -H "Content-Type: application/json" \
  -d '{
    "process": {
      "name": "Loan Origination Process",
      "description": "Process for originating mortgage loans",
      "table": "incident"
    },
    "milestones": [
      ...
    ]
  }'
```

## Troubleshooting

### Common Issues

#### API Proxy Cannot Connect to n8n

1. Verify n8n is running
2. Check the N8N_URL environment variable
3. Ensure network connectivity between the API Proxy and n8n

#### n8n Cannot Connect to ServiceNow

1. Verify ServiceNow credentials
2. Check ServiceNow instance availability
3. Ensure the API user has appropriate permissions

#### Research Operation Fails

1. Check search API credentials
2. Verify the research workflow is properly configured
3. Look for errors in the n8n execution logs

#### Implementation Operation Fails

1. Verify ServiceNow is accessible
2. Check TurboForge tables exist in ServiceNow
3. Look for errors in the n8n execution logs

### Viewing Logs

#### API Proxy Logs

```bash
tail -f /opt/turboforge-api-proxy/logs/combined.log
```

#### n8n Execution Logs

1. In n8n web interface, go to **Executions**
2. Find the failed execution
3. Click to view details and error messages

#### ServiceNow System Logs

1. In ServiceNow, navigate to **System Logs** > **System Log** > **All**
2. Filter for TurboForge-related entries

## Next Steps

After completing the basic integration, consider these advanced configurations:

1. **Authentication**: Implement API key authentication for the API Proxy
2. **HTTPS**: Configure the API Proxy to use HTTPS for secure communication
3. **Monitoring**: Set up alerts for failed operations
4. **Custom Research Sources**: Add specialized sources to the research workflow
5. **Database Integration**: Replace in-memory operation storage with a database