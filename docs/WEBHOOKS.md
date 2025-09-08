# Vatevo Webhooks

**Purpose**: Secure webhook delivery with signature verification and retry logic  
**Status**: ✅ **Implemented**  
**Version**: 1.0

## Overview

Vatevo webhooks provide real-time notifications about invoice processing events. All webhooks are signed using HMAC-SHA256 and include replay protection.

## Webhook Events

### Event Types

| Event Type | Description | Trigger |
|------------|-------------|---------|
| `invoice.created` | Invoice created successfully | POST /invoices |
| `invoice.validated` | Invoice validation completed | POST /invoices |
| `invoice.submitted` | Invoice submitted to compliance gateway | POST /invoices |
| `invoice.accepted` | Invoice accepted by compliance gateway | Webhook from gateway |
| `invoice.rejected` | Invoice rejected by compliance gateway | Webhook from gateway |
| `invoice.failed` | Invoice processing failed | Error in processing |
| `test.webhook` | Test webhook delivery | POST /webhooks/test |

### Event Payload Structure

```json
{
  "id": "evt_1234567890",
  "type": "invoice.created",
  "created": "2025-09-09T12:00:00Z",
  "data": {
    "invoice_id": "inv_1234567890",
    "tenant_id": "tenant_1234567890",
    "status": "validated",
    "country_code": "IT",
    "amount": "100.00",
    "currency": "EUR"
  },
  "api_version": "1.0"
}
```

## Webhook Security

### Signature Verification

All webhooks include a signature header for verification:

```
X-Vatevo-Signature: v1=abc123def456...
X-Vatevo-Timestamp: 1694260800
X-Vatevo-Event: invoice.created
```

### Verification Process

1. **Extract signature and timestamp** from headers
2. **Check timestamp** (must be within 5 minutes)
3. **Generate expected signature** using HMAC-SHA256
4. **Compare signatures** using constant-time comparison

### Verification Examples

#### Node.js/Express

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, timestamp, secret) {
  // Check timestamp (5 minute window)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) {
    throw new Error('Timestamp too old');
  }
  
  // Generate expected signature
  const message = `${timestamp}.${payload}`;
  const expectedSignature = `v1=${crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')}`;
  
  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Usage
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-vatevo-signature'];
  const timestamp = parseInt(req.headers['x-vatevo-timestamp']);
  const payload = req.body.toString();
  
  try {
    if (verifyWebhookSignature(payload, signature, timestamp, process.env.WEBHOOK_SECRET)) {
      const event = JSON.parse(payload);
      // Process webhook event
      console.log('Webhook verified:', event);
      res.status(200).send('OK');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(400).send('Verification failed');
  }
});
```

#### Python/FastAPI

```python
import hmac
import hashlib
import time
from fastapi import FastAPI, Request, HTTPException

def verify_webhook_signature(payload: str, signature: str, timestamp: int, secret: str) -> bool:
    # Check timestamp (5 minute window)
    current_time = int(time.time())
    if abs(current_time - timestamp) > 300:
        raise ValueError("Timestamp too old")
    
    # Generate expected signature
    message = f"{timestamp}.{payload}"
    expected_signature = f"v1={hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()}"
    
    # Compare signatures
    return hmac.compare_digest(signature, expected_signature)

app = FastAPI()

@app.post("/webhook")
async def webhook_handler(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Vatevo-Signature", "")
    timestamp = int(request.headers.get("X-Vatevo-Timestamp", "0"))
    
    try:
        if verify_webhook_signature(body.decode(), signature, timestamp, settings.WEBHOOK_SECRET):
            event = json.loads(body)
            # Process webhook event
            print(f"Webhook verified: {event}")
            return {"status": "ok"}
        else:
            raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        print(f"Webhook verification failed: {e}")
        raise HTTPException(status_code=400, detail="Verification failed")
```

#### PHP

```php
<?php
function verifyWebhookSignature($payload, $signature, $timestamp, $secret) {
    // Check timestamp (5 minute window)
    $currentTime = time();
    if (abs($currentTime - $timestamp) > 300) {
        throw new Exception('Timestamp too old');
    }
    
    // Generate expected signature
    $message = $timestamp . '.' . $payload;
    $expectedSignature = 'v1=' . hash_hmac('sha256', $message, $secret);
    
    // Compare signatures
    return hash_equals($signature, $expectedSignature);
}

// Usage
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_VATEVO_SIGNATURE'] ?? '';
$timestamp = (int)($_SERVER['HTTP_X_VATEVO_TIMESTAMP'] ?? 0);

try {
    if (verifyWebhookSignature($payload, $signature, $timestamp, $_ENV['WEBHOOK_SECRET'])) {
        $event = json_decode($payload, true);
        // Process webhook event
        error_log('Webhook verified: ' . json_encode($event));
        http_response_code(200);
        echo 'OK';
    } else {
        http_response_code(400);
        echo 'Invalid signature';
    }
} catch (Exception $e) {
    error_log('Webhook verification failed: ' . $e->getMessage());
    http_response_code(400);
    echo 'Verification failed';
}
?>
```

## Webhook Delivery

### Retry Logic

- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential (1s, 2s, 4s)
- **Timeout**: 30 seconds per attempt
- **Success Criteria**: HTTP 2xx response

### Delivery Status

| Status | Description |
|--------|-------------|
| `pending` | Webhook queued for delivery |
| `delivered` | Successfully delivered |
| `failed` | All retry attempts exhausted |

### Webhook Event Logging

All webhook events are logged in the `webhook_events` table:

```sql
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    webhook_url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP
);
```

## Testing Webhooks

### Test Webhook Delivery

```bash
# Test webhook delivery for your tenant
curl -X POST https://api.vatevo.com/webhooks/test \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Verify Webhook Signature

```bash
# Verify webhook signature
curl -X POST https://api.vatevo.com/webhooks/verify \
  -H "Content-Type: application/json" \
  -H "X-Vatevo-Signature: v1=abc123..." \
  -H "X-Vatevo-Timestamp: 1694260800" \
  -d '{"test": "payload"}'
```

### List Webhook Events

```bash
# List webhook events for your tenant
curl -X GET https://api.vatevo.com/webhooks/events \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `WEBHOOK_SECRET` | Secret key for webhook signature verification |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBHOOK_TIMEOUT` | Webhook delivery timeout (seconds) | 30 |
| `WEBHOOK_MAX_RETRIES` | Maximum retry attempts | 3 |
| `WEBHOOK_RETRY_DELAY` | Initial retry delay (seconds) | 1 |

## Best Practices

### 1. Webhook Endpoint Design

- **Idempotent**: Handle duplicate events gracefully
- **Fast Response**: Return 200 OK quickly, process asynchronously
- **Error Handling**: Return appropriate HTTP status codes
- **Logging**: Log all webhook events for debugging

### 2. Security

- **Always verify signatures** before processing
- **Check timestamps** to prevent replay attacks
- **Use HTTPS** for webhook endpoints
- **Validate event structure** before processing

### 3. Reliability

- **Handle failures gracefully** (return 5xx for retry, 4xx for no retry)
- **Implement idempotency** using event IDs
- **Monitor webhook delivery** status
- **Set up alerts** for failed deliveries

### 4. Performance

- **Process webhooks asynchronously** when possible
- **Use connection pooling** for database operations
- **Implement rate limiting** if needed
- **Monitor response times**

## Troubleshooting

### Common Issues

#### Invalid Signature
- Check that `WEBHOOK_SECRET` matches between API and endpoint
- Verify timestamp is within 5-minute window
- Ensure payload is not modified before verification

#### Delivery Failures
- Check webhook endpoint is accessible
- Verify endpoint returns 2xx status codes
- Check for network connectivity issues
- Review error messages in webhook events

#### Duplicate Events
- Implement idempotency using event IDs
- Check for webhook retry logic
- Verify endpoint is not processing events multiple times

### Debugging

1. **Check webhook events** in the API dashboard
2. **Review delivery logs** for error messages
3. **Test signature verification** with known payloads
4. **Monitor webhook endpoint** response times and status codes

---

**Last Updated**: 2025-09-09T02:00:00Z  
**API Version**: 1.0  
**Support**: [Contact Support](mailto:support@vatevo.com)
