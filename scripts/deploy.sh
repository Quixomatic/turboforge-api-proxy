#!/bin/bash

# TurboForge API Proxy Deployment Script
# This script automates the deployment of the API proxy to a server

# Display help message
function show_help {
  echo "TurboForge API Proxy Deployment Script"
  echo "Usage: ./deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help             Show this help message"
  echo "  -e, --env ENV          Specify environment (dev, test, prod)"
  echo "  -s, --server SERVER    Specify server hostname or IP"
  echo "  -u, --user USER        Specify SSH username"
  echo "  -p, --port PORT        Specify SSH port (default: 22)"
  echo "  --restart              Restart service after deployment"
  echo "  --docker               Deploy using Docker"
  echo ""
  echo "Example:"
  echo "  ./deploy.sh -e prod -s 192.168.1.100 -u ubuntu --restart"
  exit 0
}

# Default values
ENV="dev"
SERVER="localhost"
USER=$(whoami)
PORT="22"
RESTART=false
DOCKER=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      ;;
    -e|--env)
      ENV="$2"
      shift 2
      ;;
    -s|--server)
      SERVER="$2"
      shift 2
      ;;
    -u|--user)
      USER="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    --restart)
      RESTART=true
      shift
      ;;
    --docker)
      DOCKER=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# Confirm deployment
echo "Preparing to deploy TurboForge API Proxy"
echo "Environment: $ENV"
echo "Server: $SERVER"
echo "User: $USER"
echo "SSH Port: $PORT"
echo "Restart service: $RESTART"
echo "Docker deployment: $DOCKER"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled."
  exit 1
fi

# Set deployment directory based on environment
case $ENV in
  dev)
    DEPLOY_DIR="/opt/turboforge-api-proxy/dev"
    SERVICE_NAME="turboforge-api-proxy-dev"
    ;;
  test)
    DEPLOY_DIR="/opt/turboforge-api-proxy/test"
    SERVICE_NAME="turboforge-api-proxy-test"
    ;;
  prod)
    DEPLOY_DIR="/opt/turboforge-api-proxy/prod"
    SERVICE_NAME="turboforge-api-proxy"
    ;;
  *)
    echo "Invalid environment: $ENV"
    exit 1
    ;;
esac

# Create a temporary build directory
BUILD_DIR=$(mktemp -d)
echo "Building deployment package in $BUILD_DIR..."

# Copy necessary files to build directory
echo "Copying files..."
cp -r src $BUILD_DIR/
cp server.js $BUILD_DIR/
cp package.json $BUILD_DIR/
cp package-lock.json $BUILD_DIR/
cp .env.$ENV $BUILD_DIR/.env
cp start.sh $BUILD_DIR/
chmod +x $BUILD_DIR/start.sh

# Create deployment archive
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="turboforge-api-proxy-$ENV-$TIMESTAMP.tar.gz"
echo "Creating deployment archive: $ARCHIVE_NAME"
tar -czf $ARCHIVE_NAME -C $BUILD_DIR .

# Docker deployment
if [ "$DOCKER" = true ]; then
  echo "Preparing Docker deployment..."
  
  # Create Docker build context
  mkdir -p $BUILD_DIR/docker
  cp Dockerfile $BUILD_DIR/docker/
  cp $ARCHIVE_NAME $BUILD_DIR/docker/app.tar.gz
  
  # Create Docker build script
  cat > $BUILD_DIR/docker/build.sh << EOF
#!/bin/bash
echo "Building Docker image..."
docker build -t turboforge-api-proxy:$ENV .
echo "Stopping existing container..."
docker stop turboforge-api-proxy-$ENV || true
docker rm turboforge-api-proxy-$ENV || true
echo "Starting new container..."
docker run -d \\
  --name turboforge-api-proxy-$ENV \\
  -p 3000:3000 \\
  --restart unless-stopped \\
  --env-file /opt/turboforge-api-proxy/$ENV/.env \\
  turboforge-api-proxy:$ENV
echo "Docker deployment complete."
EOF
  chmod +x $BUILD_DIR/docker/build.sh
  
  # Create Docker deployment archive
  DOCKER_ARCHIVE="turboforge-api-proxy-docker-$ENV-$TIMESTAMP.tar.gz"
  echo "Creating Docker deployment archive: $DOCKER_ARCHIVE"
  tar -czf $DOCKER_ARCHIVE -C $BUILD_DIR/docker .
  
  # Upload Docker deployment archive
  echo "Uploading Docker deployment archive to $SERVER..."
  scp -P $PORT $DOCKER_ARCHIVE $USER@$SERVER:/tmp/
  
  # Deploy on remote server
  echo "Deploying on $SERVER..."
  ssh -p $PORT $USER@$SERVER << EOF
    mkdir -p /opt/turboforge-api-proxy/$ENV
    tar -xzf /tmp/$DOCKER_ARCHIVE -C /opt/turboforge-api-proxy/$ENV
    cd /opt/turboforge-api-proxy/$ENV
    ./build.sh
    rm /tmp/$DOCKER_ARCHIVE
EOF
  
  echo "Docker deployment completed successfully."
else
  # Standard deployment
  echo "Uploading deployment archive to $SERVER..."
  scp -P $PORT $ARCHIVE_NAME $USER@$SERVER:/tmp/
  
  # Deploy on remote server
  echo "Deploying on $SERVER..."
  ssh -p $PORT $USER@$SERVER << EOF
    mkdir -p $DEPLOY_DIR
    mkdir -p $DEPLOY_DIR/backup
    
    # Backup existing deployment
    if [ -f $DEPLOY_DIR/package.json ]; then
      echo "Backing up existing deployment..."
      BACKUP_NAME="backup-\$(date +%Y%m%d-%H%M%S).tar.gz"
      tar -czf $DEPLOY_DIR/backup/\$BACKUP_NAME -C $DEPLOY_DIR --exclude="./backup" .
    fi
    
    # Deploy new version
    echo "Extracting new deployment..."
    tar -xzf /tmp/$ARCHIVE_NAME -C $DEPLOY_DIR
    
    # Install dependencies
    echo "Installing dependencies..."
    cd $DEPLOY_DIR
    npm ci --production
    
    # Set up service if it doesn't exist
    if [ ! -f /etc/systemd/system/$SERVICE_NAME.service ]; then
      echo "Creating systemd service..."
      cat > /tmp/$SERVICE_NAME.service << EEOF
[Unit]
Description=TurboForge API Proxy ($ENV)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node $DEPLOY_DIR/server.js
Restart=on-failure
Environment=NODE_ENV=$ENV

[Install]
WantedBy=multi-user.target
EEOF
      sudo mv /tmp/$SERVICE_NAME.service /etc/systemd/system/
      sudo systemctl daemon-reload
      sudo systemctl enable $SERVICE_NAME
    fi
    
    # Restart service if requested
    if [ "$RESTART" = "true" ]; then
      echo "Restarting service..."
      sudo systemctl restart $SERVICE_NAME
    fi
    
    # Clean up
    rm /tmp/$ARCHIVE_NAME
EOF
  
  echo "Deployment completed successfully."
fi

# Clean up local build files
echo "Cleaning up..."
rm -rf $BUILD_DIR
rm $ARCHIVE_NAME
if [ "$DOCKER" = true ]; then
  rm $DOCKER_ARCHIVE
fi

echo "Deployment process completed."