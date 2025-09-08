# Vatevo Python SDK

Official Python SDK for the Vatevo API.

## Installation

```bash
pip install vatevo-sdk
```

## Quick Start

```python
from vatevo import create_client

# Create client
client = create_client(api_key="your-api-key")

# Health check
health = client.health_check()
print(health)  # {'status': 'ok', 'service': 'vatevo-api'}

# Create an invoice
from vatevo import InvoiceCreate, SupplierInfo, CustomerInfo, LineItem

invoice_data = InvoiceCreate(
    country_code="IT",
    supplier=SupplierInfo(
        name="Test Supplier",
        vat_id="IT12345678901",
        address="Via Roma 1",
        city="Milano",
        postal_code="20100",
        country="IT"
    ),
    customer=CustomerInfo(
        name="Test Customer",
        vat_id="IT98765432109",
        address="Via Milano 2",
        city="Roma",
        postal_code="00100",
        country="IT"
    ),
    line_items=[
        LineItem(
            description="Test Item",
            quantity=1,
            unit_price="100.00",
            tax_rate=22.0,
            tax_amount="22.00",
            line_total="100.00"
        )
    ]
)

invoice = client.create_invoice(invoice_data)
print(invoice)
```

## API Reference

### Client Configuration

```python
from vatevo import VatevoClient, VatevoConfig

config = VatevoConfig(
    api_key="your-api-key",
    base_url="https://api.vatevo.com",  # optional
    timeout=30  # optional
)

client = VatevoClient(config)
```

### Health Checks

```python
# Basic health check
health = client.health_check()

# Readiness check
ready = client.health_ready()

# Database health check
db_health = client.health_db()
```

### Invoice Management

```python
# Create invoice
invoice = client.create_invoice(invoice_data)

# Get invoice
invoice = client.get_invoice(invoice_id)

# List invoices
invoices = client.list_invoices(
    status="validated",
    skip=0,
    limit=10
)

# Retry failed invoice
invoice = client.retry_invoice(invoice_id)
```

### Validation

```python
# Validate invoice data
result = client.validate_invoice(invoice_data)
if result.valid:
    print("Invoice is valid")
else:
    print("Validation errors:", result.errors)
```

### Webhooks

```python
# Test webhook delivery
result = client.test_webhook()

# List webhook events
events = client.list_webhook_events()

# Verify webhook signature
is_valid = client.verify_webhook_signature(
    payload, signature, timestamp
)
```

## Error Handling

```python
import httpx

try:
    invoice = client.create_invoice(data)
except httpx.HTTPStatusError as e:
    print(f"API Error: {e.response.status_code}")
    print(f"Response: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network Error: {e}")
```

## Webhook Verification

```python
import hmac
import hashlib
import time

def verify_webhook_signature(payload: str, signature: str, timestamp: int, secret: str) -> bool:
    # Check timestamp (5 minute window)
    current_time = int(time.time())
    if abs(current_time - timestamp) > 300:
        return False
    
    # Generate expected signature
    message = f"{timestamp}.{payload}"
    expected_signature = f"v1={hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()}"
    
    # Compare signatures
    return hmac.compare_digest(signature, expected_signature)

# Usage in FastAPI
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhook")
async def webhook_handler(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Vatevo-Signature", "")
    timestamp = int(request.headers.get("X-Vatevo-Timestamp", "0"))
    
    if verify_webhook_signature(body.decode(), signature, timestamp, settings.WEBHOOK_SECRET):
        event = json.loads(body)
        # Process webhook event
        return {"status": "ok"}
    else:
        raise HTTPException(status_code=400, detail="Invalid signature")
```

## Context Manager

```python
# Use as context manager for automatic cleanup
with create_client(api_key="your-api-key") as client:
    invoice = client.create_invoice(data)
    # Client is automatically closed
```

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black src/

# Sort imports
isort src/

# Type checking
mypy src/
```

## License

MIT
