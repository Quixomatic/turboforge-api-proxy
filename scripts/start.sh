#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "No .env file found. Creating from example..."
  cp .env.example .env
  echo "Please update .env with your configuration."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
  echo "Creating logs directory..."
  mkdir -p logs
fi

# Start the application
echo "Starting TurboForge API Proxy..."
if [ "$NODE_ENV" = "production" ]; then
  node server.js
else
  # Use nodemon for development if available
  if command -v nodemon &> /dev/null; then
    echo "Using nodemon for development..."
    nodemon server.js
  else
    echo "Nodemon not found, using node instead..."
    node server.js
  fi
fi