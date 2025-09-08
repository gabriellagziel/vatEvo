# Vatevo Quickstart Guide

**Get up and running with Vatevo in 5 minutes**

## 1. Get Your API Key

1. **Sign up** at [vatevo.com](https://vatevo.com)
2. **Create a tenant** in your dashboard
3. **Copy your API key** from the tenant settings

## 2. Choose Your Integration Method

### Option A: Use Our SDKs (Recommended)

#### TypeScript/Node.js
```bash
npm install @vatevo/sdk
```

```typescript
import { createClient } from '@vatevo/sdk';

const client = createClient({
  apiKey: 'your-api-key'
});

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

console.log('Invoice created:', invoice);
```

#### Python
```bash
pip install vatevo-sdk
```

```python
from vatevo import create_client, InvoiceCreate, SupplierInfo, CustomerInfo, LineItem

client = create_client(api_key='your-api-key')

# Create an invoice
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
print(f'Invoice created: {invoice}')
```

### Option B: Direct API Calls

```bash
curl -X POST https://api.vatevo.com/invoices \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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
    "line_items": [
      {
        "description": "Test Item",
        "quantity": 1,
        "unit_price": "100.00",
        "tax_rate": 22.0,
        "tax_amount": "22.00",
        "line_total": "100.00"
      }
    ]
  }'
```

## 3. Set Up Webhooks (Optional)

### Configure Webhook URL

```bash
curl -X POST https://api.vatevo.com/tenants \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "webhook_url": "https://your-app.com/webhook"
  }'
```

### Verify Webhook Signature

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, timestamp: number, secret: string): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) {
    throw new Error('Timestamp too old');
  }
  
  const message = `${timestamp}.${payload}`;
  const expectedSignature = `v1=${crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-vatevo-signature'] as string;
  const timestamp = parseInt(req.headers['x-vatevo-timestamp'] as string);
  const payload = req.body.toString();
  
  if (verifyWebhookSignature(payload, signature, timestamp, process.env.WEBHOOK_SECRET!)) {
    const event = JSON.parse(payload);
    console.log('Webhook received:', event);
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});
```

## 4. Test Your Integration

### Health Check
```bash
curl https://api.vatevo.com/healthz
```

### Validate Invoice Data
```bash
curl -X POST https://api.vatevo.com/validate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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
    "line_items": [
      {
        "description": "Test Item",
        "quantity": 1,
        "unit_price": "100.00",
        "tax_rate": 22.0,
        "tax_amount": "22.00",
        "line_total": "100.00"
      }
    ]
  }'
```

### Test Webhook Delivery
```bash
curl -X POST https://api.vatevo.com/webhooks/test \
  -H "Authorization: Bearer your-api-key"
```

## 5. Next Steps

### Explore the API
- **API Documentation**: [https://api.vatevo.com/docs](https://api.vatevo.com/docs)
- **OpenAPI Spec**: [https://api.vatevo.com/openapi.json](https://api.vatevo.com/openapi.json)
- **Postman Collection**: Import `docs/VATEVO.postman_collection.json`

### Learn More
- **Webhooks Guide**: [docs/WEBHOOKS.md](docs/WEBHOOKS.md)
- **Error Codes**: [docs/ERRORS.md](docs/ERRORS.md)
- **Compliance Matrix**: [docs/COMPLIANCE_MATRIX.md](docs/COMPLIANCE_MATRIX.md)

### Get Support
- **Documentation**: [docs.vatevo.com](https://docs.vatevo.com)
- **Support Email**: [support@vatevo.com](mailto:support@vatevo.com)
- **GitHub Issues**: [github.com/gabriellagziel/vatEvo/issues](https://github.com/gabriellagziel/vatEvo/issues)

## Common Use Cases

### 1. Validate Invoice Before Creating
```typescript
// Validate first
const validation = await client.validateInvoice(invoiceData);
if (validation.valid) {
  // Create invoice
  const invoice = await client.createInvoice(invoiceData);
} else {
  console.log('Validation errors:', validation.errors);
}
```

### 2. Handle Webhook Events
```typescript
app.post('/webhook', (req, res) => {
  const event = JSON.parse(req.body);
  
  switch (event.type) {
    case 'invoice.created':
      // Invoice was created successfully
      break;
    case 'invoice.validated':
      // Invoice passed validation
      break;
    case 'invoice.submitted':
      // Invoice submitted to compliance gateway
      break;
    case 'invoice.accepted':
      // Invoice accepted by compliance gateway
      break;
    case 'invoice.rejected':
      // Invoice rejected by compliance gateway
      break;
    case 'invoice.failed':
      // Invoice processing failed
      break;
  }
  
  res.status(200).send('OK');
});
```

### 3. Retry Failed Invoices
```typescript
// List failed invoices
const failedInvoices = await client.listInvoices({ status: 'failed' });

// Retry each failed invoice
for (const invoice of failedInvoices) {
  try {
    const retriedInvoice = await client.retryInvoice(invoice.id);
    console.log('Invoice retried:', retriedInvoice);
  } catch (error) {
    console.error('Retry failed:', error);
  }
}
```

---

**Ready to start?** [Get your API key](https://vatevo.com) and follow the steps above!
