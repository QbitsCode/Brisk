#!/bin/bash

# Set Node options for larger memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build Next.js app
echo "Building Next.js application..."
npm run build

# Success message
echo "Build completed successfully!"
