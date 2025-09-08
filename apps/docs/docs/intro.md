# Welcome to Vatevo

**Compliance-as-a-Service for EU e-invoicing**

Vatevo provides a comprehensive API for EU e-invoicing compliance, supporting multiple countries and formats including ViDA, UBL 2.1, EN16931, and country-specific implementations.

## What is Vatevo?

Vatevo is a modern, API-first platform that simplifies EU e-invoicing compliance for businesses of all sizes. We handle the complexity of different country requirements, format conversions, and compliance gateways so you can focus on your business.

## Key Features

- **Multi-Country Support**: Italy, Germany, France, Spain, Netherlands, and more
- **Multiple Formats**: UBL 2.1, EN16931, FatturaPA, XRechnung, Factur-X
- **Compliance Gateways**: Direct integration with Peppol, SDI, PPF, KSeF
- **Developer-Friendly**: RESTful API, SDKs, comprehensive documentation
- **Webhook Support**: Real-time notifications for invoice processing events
- **Security**: HMAC-SHA256 webhook signing, rate limiting, audit logging

## Quick Start

Get started with Vatevo in 5 minutes:

1. **Sign up** at [vatevo.com](https://vatevo.com)
2. **Get your API key** from the dashboard
3. **Install an SDK** or use direct API calls
4. **Create your first invoice**

```typescript
import { createClient } from '@vatevo/sdk';

const client = createClient({
  apiKey: 'your-api-key'
});

const invoice = await client.createInvoice({
  country_code: 'IT',
  supplier: { /* supplier data */ },
  customer: { /* customer data */ },
  line_items: [/* line items */]
});
```

## Supported Countries

| Country | Format | Gateway | Status |
|---------|--------|---------|--------|
| Italy | FatturaPA | SDI | ✅ Implemented |
| Germany | XRechnung | Peppol | ✅ Implemented |
| France | Factur-X | PPF | ✅ Implemented |
| Spain | EN16931 | Peppol | ✅ Implemented |
| Netherlands | EN16931 | Peppol | ✅ Implemented |
| Poland | KSeF | KSeF | 🚧 In Development |

## What's Next?

- **[Quickstart Guide](quickstart)** - Get up and running in 5 minutes
- **[API Reference](api/overview)** - Complete API documentation
- **[Webhooks](webhooks/overview)** - Real-time event notifications
- **[SDKs](sdks/typescript)** - Language-specific SDKs and examples
- **[Compliance Matrix](compliance/matrix)** - Country and format support

## Need Help?

- **Documentation**: Browse our comprehensive guides
- **API Reference**: Explore our interactive API docs
- **Support**: Contact us at [support@vatevo.com](mailto:support@vatevo.com)
- **GitHub**: Check out our [open source components](https://github.com/gabriellagziel/vatEvo)

---

Ready to get started? [Create your account](https://vatevo.com) and follow our [Quickstart Guide](quickstart)!
