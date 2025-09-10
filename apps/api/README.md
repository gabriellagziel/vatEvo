# Vatevo API

The Vatevo API is a high-performance, multi-tenant REST API built with FastAPI that provides comprehensive EU e-invoicing compliance services for SaaS companies.

## Features

- **Multi-tenant Architecture**: Complete tenant isolation with API key authentication
- **EU Compliance Engine**: UBL 2.1 + EN16931 compliant invoice generation
- **Country Adapters**: Pre-built adapters for Italy (SDI), Germany (Peppol), France (PPF)
- **Real-time Webhooks**: Event-driven architecture for instant status updates
- **Comprehensive Validation**: Business rules engine with country-specific validation
- **WORM Archival**: Immutable invoice storage for compliance requirements

## Tech Stack

- **Framework**: FastAPI 0.116.1
- **Language**: Python 3.12
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for session management and rate limiting
- **Storage**: AWS S3 EU for WORM-compliant archival
- **Authentication**: JWT + API key per tenant
- **Testing**: Pytest with 80% coverage

## API Endpoints

### Core Endpoints
- `POST /invoices` - Create new invoice
- `GET /invoices/{id}` - Retrieve invoice details
- `GET /invoices` - List invoices with filtering
- `POST /invoices/{id}/retry` - Retry failed invoice
- `POST /validate` - Validate invoice data
- `GET /healthz` - Health check endpoint
- `GET /webhooks/test` - Test webhook delivery

### Authentication
All endpoints require API key authentication via `Authorization: Bearer <api_key>` header.

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Configure your environment variables

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/vatevo

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=vatevo-invoices

# Authentication
AUTH_SECRET=your_jwt_secret
API_KEYS_SIGNING_KEY=your_signing_key

# External Services
STRIPE_API_KEY=your_stripe_key
```

### Example Usage

```python
import httpx

# Create an invoice
response = httpx.post(
    "https://api.vatevo.com/invoices",
    headers={"Authorization": "Bearer your_api_key"},
    json={
        "country_code": "IT",
        "supplier": {
            "name": "Test Supplier",
            "vat_id": "IT12345678901",
            "address": "Via Roma 1",
            "city": "Milano",
            "postal_code": "20100",
            "country": "IT"
        },
        "customer": {
            "name": "Test Customer",
            "vat_id": "IT98765432109",
            "address": "Via Milano 2",
            "city": "Roma",
            "postal_code": "00100",
            "country": "IT"
        },
        "line_items": [{
            "description": "Test Item",
            "quantity": 1,
            "unit_price": "100.00",
            "tax_rate": 22.0,
            "tax_amount": "22.00",
            "line_total": "100.00"
        }]
    }
)

print(response.json())
```

## Country Support

| Country | Code | Format | Gateway | Status |
|---------|------|--------|---------|--------|
| **Italy** | IT | FatturaPA | SDI | ✅ Complete |
| **Germany** | DE | XRechnung | Peppol | ✅ Complete |
| **France** | FR | Factur-X | PPF | ✅ Complete |
| **Spain** | ES | EN16931 | Peppol | 🚧 In Progress |
| **Netherlands** | NL | EN16931 | Peppol | 🚧 In Progress |

## Architecture

### Multi-tenant Design
- **Tenant Isolation**: Schema-based separation with API key routing
- **Data Residency**: EU-only infrastructure for GDPR compliance
- **Scalability**: Horizontal scaling with Redis session management

### Compliance Engine
- **UBL 2.1 Generation**: Full EN16931 compliant XML
- **Country Adapters**: Modular adapter system for different countries
- **Validation Engine**: Comprehensive business rules validation
- **Error Handling**: Detailed error responses with retry mechanisms

### Security
- **JWT Authentication**: Secure token-based authentication
- **API Key Management**: Per-tenant API key generation and rotation
- **Rate Limiting**: Per-tenant rate limiting with Redis
- **Audit Logging**: Comprehensive logging for compliance

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_invoices.py
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Quality

```bash
# Format code
black app/

# Sort imports
isort app/

# Type checking
mypy app/
```

## Deployment

The API is deployed on Fly.io with automatic deployments from the main branch.

**Live URL**: [https://api.vatevo.com](https://api.vatevo.com)  
**API Documentation**: [https://api.vatevo.com/docs](https://api.vatevo.com/docs)  
**OpenAPI Spec**: [https://api.vatevo.com/openapi.json](https://api.vatevo.com/openapi.json)

## Monitoring

- **Health Checks**: `/healthz` endpoint for load balancers
- **Metrics**: Prometheus metrics for monitoring
- **Logging**: Structured logging with correlation IDs
- **Error Tracking**: Sentry integration for error monitoring

## Support

- **Documentation**: [https://docs.vatevo.com](https://docs.vatevo.com)
- **API Reference**: [https://api.vatevo.com/docs](https://api.vatevo.com/docs)
- **Support Email**: [support@vatevo.com](mailto:support@vatevo.com)
- **GitHub Issues**: [https://github.com/gabriellagziel/vatEvo/issues](https://github.com/gabriellagziel/vatEvo/issues)

## License

MIT License - see [LICENSE](../../LICENSE) for details.
