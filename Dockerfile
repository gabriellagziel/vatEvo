# Vatevo API Dockerfile
# Multi-stage build for production deployment

FROM python:3.12-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r vatevo && useradd -r -g vatevo vatevo

# Set work directory
WORKDIR /app

# Copy requirements first for better caching
COPY apps/api/pyproject.toml apps/api/poetry.lock ./

# Install Poetry
RUN pip install poetry

# Configure Poetry
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-dev --no-root

# Copy application code
COPY apps/api/ ./

# Create necessary directories
RUN mkdir -p /app/logs /app/data && \
    chown -R vatevo:vatevo /app

# Switch to non-root user
USER vatevo

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health/ready || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
