# Vatevo TypeScript SDK

Official TypeScript SDK for the Vatevo API.

## Installation

```bash
npm install @vatevo/sdk
```

## Quick Start

```typescript
import { createClient } from '@vatevo/sdk';

const client = createClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.vatevo.com' // optional
});

// Health check
const health = await client.healthCheck();
console.log(health); // { status: 'ok', service: 'vatevo-api' }

// Create an invoice
const invoice = await client.createInvoice({
  country_code: 'IT',
  supplier: {
    name: 'Test Supplier',
    vat_id: 'IT12345678901',
    address: 'Via Roma 1',
    city: 'Milano',
    postal_code: '20100',
    country: 'IT'
  },
  customer: {
    name: 'Test Customer',
    vat_id: 'IT98765432109',
    address: 'Via Milano 2',
    city: 'Roma',
    postal_code: '00100',
    country: 'IT'
  },
  line_items: [{
    description: 'Test Item',
    quantity: 1,
    unit_price: '100.00',
    tax_rate: 22.0,
    tax_amount: '22.00',
    line_total: '100.00'
  }]
});

console.log(invoice);
```

## API Reference

### Client Configuration

```typescript
interface VatevoConfig {
  apiKey: string;           // Your API key
  baseUrl?: string;         // API base URL (default: https://api.vatevo.com)
  timeout?: number;         // Request timeout in ms (default: 30000)
}
```

### Health Checks

```typescript
// Basic health check
await client.healthCheck();

// Readiness check
await client.healthReady();

// Database health check
await client.healthDb();
```

### Invoice Management

```typescript
// Create invoice
const invoice = await client.createInvoice(invoiceData);

// Get invoice
const invoice = await client.getInvoice(invoiceId);

// List invoices
const invoices = await client.listInvoices({
  status: 'validated',
  skip: 0,
  limit: 10
});

// Retry failed invoice
const invoice = await client.retryInvoice(invoiceId);
```

### Validation

```typescript
// Validate invoice data
const result = await client.validateInvoice(invoiceData);
if (result.valid) {
  console.log('Invoice is valid');
} else {
  console.log('Validation errors:', result.errors);
}
```

### Webhooks

```typescript
// Test webhook delivery
const result = await client.testWebhook();

// List webhook events
const events = await client.listWebhookEvents();

// Verify webhook signature
const isValid = await client.verifyWebhookSignature(
  payload,
  signature,
  timestamp
);
```

## Error Handling

```typescript
try {
  const invoice = await client.createInvoice(data);
} catch (error) {
  if (error.response) {
    // API error
    console.error('API Error:', error.response.data);
    console.error('Status:', error.response.status);
  } else {
    // Network error
    console.error('Network Error:', error.message);
  }
}
```

## Webhook Verification

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, timestamp: number, secret: string): boolean {
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

// Usage in Express
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-vatevo-signature'] as string;
  const timestamp = parseInt(req.headers['x-vatevo-timestamp'] as string);
  const payload = req.body.toString();
  
  if (verifyWebhookSignature(payload, signature, timestamp, process.env.WEBHOOK_SECRET!)) {
    const event = JSON.parse(payload);
    // Process webhook event
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## License

MIT
