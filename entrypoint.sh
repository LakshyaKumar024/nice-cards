#!/bin/sh

# Start Next.js app in background
echo "Starting Next.js app..."
bun run start &
NEXT_PID=$!

# Start Express uploader server in background
echo "Starting Express uploader server..."
bun ./express-uploader/server.ts &
EXPRESS_PID=$!

# Function to handle shutdown gracefully
cleanup() {
  echo "Shutting down services..."
  kill $NEXT_PID 2>/dev/null
  kill $EXPRESS_PID 2>/dev/null
  wait $NEXT_PID 2>/dev/null
  wait $EXPRESS_PID 2>/dev/null
  exit 0
}

# Trap SIGTERM and SIGINT to cleanup
trap cleanup SIGTERM SIGINT

# Wait for both processes
wait
