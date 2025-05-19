#!/bin/bash
set -e

# Function to check service health
check_service() {
  local service=$1
  local url=$2
  local max_retries=${3:-30}
  local wait_time=${4:-2}
  
  echo "Checking connection to $service at $url..."
  
  for i in $(seq 1 $max_retries); do
    if curl -s -f -o /dev/null "$url"; then
      echo "$service is available!"
      return 0
    fi
    
    echo "Waiting for $service... ($i/$max_retries)"
    sleep $wait_time
  done
  
  echo "ERROR: Could not connect to $service at $url after $max_retries attempts."
  return 1
}

# Wait for dependent services if needed
if [[ -n "$N8N_URL" && "$N8N_URL" != "http://localhost"* ]]; then
  check_service "n8n" "$N8N_URL/healthz"
fi

if [[ -n "$OLLAMA_URL" && "$OLLAMA_URL" != "http://localhost"* ]]; then
  check_service "Ollama" "$OLLAMA_URL/version" 
fi

# Run custom init commands if provided
if [[ -n "$INIT_COMMAND" ]]; then
  echo "Running custom init command: $INIT_COMMAND"
  eval "$INIT_COMMAND"
fi

# Create logs directory if it doesn't exist
mkdir -p /app/logs

# Print environment info
node -v
npm -v
echo "NODE_ENV: $NODE_ENV"

# Execute the main command
exec "$@"