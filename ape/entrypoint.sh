#!/bin/sh

#
# entrypoint.sh
#
# Docker container entrypoint for development mode
#
# This script ensures that dependencies are installed and the frontend is built
# before starting the backend server. This is necessary when source code is
# mounted as a volume, which overwrites the built files from the Dockerfile.
#
# Steps:
# 1. Check if node_modules exists and is populated
# 2. If not: run npm ci --no-audit to install dependencies
# 3. Check if frontend is built (client/dist exists)
# 4. If not: run npm run frontend to build frontend
# 5. Execute the original CMD (passed as arguments)
#

set -e  # Exit on error

echo "🚀 Container starting - checking dependencies..."

# Check if node_modules is empty or doesn't exist
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "📦 node_modules not found or empty - installing dependencies..."
    npm ci --no-audit
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if frontend is built (client/dist directory exists and has files)
if [ ! -d "client/dist" ] || [ -z "$(ls -A client/dist 2>/dev/null)" ]; then
    echo "🏗️  Frontend not built - building now..."
    npm run frontend
    echo "✅ Frontend built"
else
    echo "✅ Frontend already built"
fi

echo "🎯 Starting application..."
echo ""

# Execute the CMD from Dockerfile or docker-compose
exec "$@"
