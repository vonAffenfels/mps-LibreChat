#!/bin/bash

#
# dev-frontend.sh
#
# Purpose: Start frontend development server inside Docker container with hot-reload
#
# This script enables frontend development in the Docker environment by:
# - Ensuring Docker is available
# - Starting docker-compose services if not already running
# - Executing 'npm run frontend:dev' inside the api container
#
# Prerequisites:
# - Docker must be installed and running
# - Source code must be mounted as volumes (configured in docker-compose.override.yml)
#
# Usage:
#   ./ape/dev-frontend.sh
#
# The script will automatically:
# 1. Check if Docker daemon is running
# 2. Check if docker-compose services are up
# 3. Start services with './dc up -d' if needed
# 4. Execute 'npm run frontend:dev' in the api container
#
# Hot-reload will work automatically because the source code is mounted as a volume.
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}🚀 Starting Frontend Development Server in Docker${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Error: Docker daemon is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is available and running${NC}"

# Change to ape directory for docker-compose commands
cd "$SCRIPT_DIR"

# Check if dc script exists
if [ ! -f "./dc" ]; then
    echo -e "${RED}❌ Error: ./dc script not found${NC}"
    echo "Expected to find docker-compose wrapper at: $SCRIPT_DIR/dc"
    exit 1
fi

# Check if docker-compose services are running
if ! ./dc ps | grep -q "api.*Up"; then
    echo -e "${YELLOW}⚠ Docker-compose services are not running${NC}"
    echo -e "${GREEN}Starting docker-compose services...${NC}"

    # Start services in detached mode
    if ! ./dc up -d; then
        echo -e "${RED}❌ Error: Failed to start docker-compose services${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Docker-compose services started${NC}"
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 5
else
    echo -e "${GREEN}✓ Docker-compose services are already running${NC}"
fi

# Execute npm run frontend:dev in the api container
echo ""
echo -e "${GREEN}🎯 Starting frontend dev server (npm run frontend:dev)${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the dev server${NC}"
echo ""

# Execute the command in the container
# Note: This will attach to the container's output, so you'll see live logs
if ! ./dc exec api npm run frontend:dev; then
    echo ""
    echo -e "${RED}❌ Error: Failed to start frontend dev server${NC}"
    echo "Common issues:"
    echo "  - Check if the api container is running: ./dc ps"
    echo "  - Check container logs: ./dc logs api"
    echo "  - Verify that source code is mounted correctly"
    exit 1
fi
