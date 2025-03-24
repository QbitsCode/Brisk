FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scientific packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY docker-requirements.txt .
RUN pip install --no-cache-dir -r docker-requirements.txt

# Copy application code
COPY quantum_backend ./quantum_backend

# Expose port
EXPOSE 8080

# Command to run the service
CMD ["uvicorn", "quantum_backend.quantum_service:app", "--host", "0.0.0.0", "--port", "8080"]
