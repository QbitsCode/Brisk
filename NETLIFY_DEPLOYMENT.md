# Brisk Quantum Framework - Netlify Deployment Guide

This document outlines the steps for deploying the Brisk quantum application on Netlify.

## Deployment Architecture

The Brisk application consists of two main components:

1. **Frontend**: Next.js application with quantum circuit visualization
2. **Backend**: Python FastAPI service with quantum simulation capabilities

## Frontend Deployment (Netlify)

The frontend is deployed directly on Netlify using the following configuration:

### Configuration Files

- `netlify.toml`: Defines build settings and redirects
- `netlify-build.sh`: Custom build script with optimized settings
- `next.config.js`: Configured for static export with Netlify

### Environment Variables

For the frontend deployment, set the following environment variables in the Netlify dashboard:

- `NEXT_PUBLIC_QUANTUM_SERVICE_URL`: URL to your backend service
- `NODE_VERSION`: 18 (recommended for Next.js compatibility)

## Backend Deployment

For the backend, you have several options:

1. **Deploy on Netlify Functions** (for light workloads)
2. **Deploy on a separate platform** (recommended for computation-heavy workloads):
   - Heroku
   - Digital Ocean
   - AWS
   - Google Cloud Run

### Backend Configuration

The backend service is configured with CORS to allow requests from Netlify domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.netlify.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Connecting Frontend and Backend

Once both services are deployed, update the environment variable in your Netlify dashboard:

`NEXT_PUBLIC_QUANTUM_SERVICE_URL` = `https://your-backend-url.com`

## Health Check

The backend provides a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "service": "quantum-backend"
}
```

This can be used for monitoring service health.
