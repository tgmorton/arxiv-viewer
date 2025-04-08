#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Please install Node.js to run this application."
  exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the application server in the background
echo "Starting ArXiv Viewer server..."
node server.js > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for the server to start
sleep 2

# Open the default browser to the application
echo "Opening ArXiv Viewer in browser..."
open http://localhost:3000

# Trap to handle CTRL+C and properly shut down the server
trap cleanup INT TERM
cleanup() {
  echo "Shutting down server..."
  kill $SERVER_PID
  exit 0
}

# Display message
echo "ArXiv Viewer is running. Press Ctrl+C to stop."

# Keep the script running until Ctrl+C
while true; do
  sleep 1
done