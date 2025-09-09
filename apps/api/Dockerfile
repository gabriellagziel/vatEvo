# syntax=docker/dockerfile:1.6
FROM python:3.11-slim
WORKDIR /app

ARG GIT_SHA=unknown
ARG BUILD_TIME=unknown
ARG APP_VERSION=0.1.0
ARG APP_ENV=production
ENV GIT_SHA=${GIT_SHA} BUILD_TIME=${BUILD_TIME} APP_VERSION=${APP_VERSION} APP_ENV=${APP_ENV}

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install core dependencies needed for the API to run
RUN pip install --no-cache-dir \
    fastapi==0.116.1 \
    uvicorn[standard]==0.32.1 \
    pydantic==2.10.6 \
    pydantic-settings==2.10.1 \
    python-multipart==0.0.20

COPY apps/api /app/apps/api
ENV PYTHONPATH=/app
EXPOSE 8080
CMD ["uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "8080"]


