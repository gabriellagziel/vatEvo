# Vatevo

<div align="center">
  <img src="/assets/logo.png" alt="Vatevo Logo" width="200" height="200">
  
  ## One API. Full EU ViDA Compliance. Zero Headaches.
  
  *The API-first platform that makes EU e-invoicing compliance simple for SaaS companies*
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Website-blue?style=for-the-badge&logo=vercel)](https://vatevo.com)
  [![API Docs](https://img.shields.io/badge/API%20Docs-Interactive-green?style=for-the-badge&logo=swagger)](https://docs.vatevo.com)
  [![Dashboard](https://img.shields.io/badge/Dashboard-Try%20Now-purple?style=for-the-badge&logo=next.js)](https://dashboard.vatevo.com)
</div>

---

## 🚀 What is Vatevo?

Vatevo is the **first API-first platform** designed specifically for SaaS companies to achieve **full EU ViDA (VAT in the Digital Age) compliance** with a single integration. 

Starting July 1, 2030, **all B2B cross-border transactions in the EU** will require **mandatory e-invoicing**. Non-compliance means **fines up to €50,000**, **blocked services**, and **rejected invoices** that can cripple your business.

Vatevo eliminates this complexity by providing **one unified API** that handles validation, formatting, submission, and archiving across **all 27 EU member states** with pre-built country adapters.

## 🎯 Live Demo

| Service | URL | Description |
|---------|-----|-------------|
| **Website** | [https://vatevo.com](https://vatevo.com) | Marketing site with ViDA compliance info |
| **Dashboard** | [https://dashboard.vatevo.com](https://dashboard.vatevo.com) | Interactive invoice management |
| **API Docs** | [https://docs.vatevo.com](https://docs.vatevo.com) | Interactive API documentation |
| **API Endpoint** | [https://api.vatevo.com](https://api.vatevo.com) | REST API with OpenAPI spec |

## ⚡ Quick Start

### 1. Get Your API Key
```bash
# Sign up at vatevo.com and get your API key
export VATEVO_API_KEY="vatevo_your_api_key_here"
```

### 2. Create Your First Invoice
```bash
curl -X POST https://api.vatevo.com/invoices \
  -H "Authorization: Bearer $VATEVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "IT",
    "supplier": {
      "name": "Your SaaS Company",
      "vat_id": "IT12345678901",
      "address": "Via Roma 1",
      "city": "Milano",
      "postal_code": "20100",
      "country": "IT"
    },
    "customer": {
      "name": "EU Customer",
      "vat_id": "IT98765432109",
      "address": "Via Milano 2",
      "city": "Roma",
      "postal_code": "00100",
      "country": "IT"
    },
    "line_items": [{
      "description": "SaaS Subscription",
      "quantity": 1,
      "unit_price": "100.00",
      "tax_rate": 22.0,
      "tax_amount": "22.00",
      "line_total": "100.00"
    }]
  }'
```

### 3. Use Our SDKs
```typescript
// TypeScript/Node.js
import { createClient } from '@vatevo/sdk';

const client = createClient({
  apiKey: 'your-api-key'
});

const invoice = await client.createInvoice(invoiceData);
```

```python
# Python
from vatevo import create_client

client = create_client(api_key='your-api-key')
invoice = client.create_invoice(invoice_data)
```

## 🏗️ Architecture

<div align="center">
  <img src="/assets/architecture.png" alt="Vatevo Architecture" width="800">
</div>

### API-First Design
- **Multi-tenant SaaS architecture** with complete tenant isolation
- **RESTful API** with OpenAPI 3.1 specification
- **Real-time webhooks** for invoice status updates
- **Comprehensive validation** with business rules engine

### Country Adapters
- **Italy (SDI)**: Complete FatturaPA XML implementation
- **Germany (XRechnung)**: Peppol BIS 3.0 integration
- **France (Factur-X)**: PPF gateway integration
- **EU Generic**: EN16931 compliant for all other countries

### Tech Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | FastAPI + Python 3.12 | High-performance API server |
| **Frontend** | Next.js 15 + TypeScript | Modern dashboard and docs |
| **Database** | PostgreSQL | Multi-tenant data storage |
| **Cache** | Redis | Session and rate limiting |
| **Storage** | AWS S3 EU | WORM-compliant archival |
| **Hosting** | Fly.io + Vercel | Global edge deployment |
| **SDKs** | Python + TypeScript | Developer-friendly integration |

## 🏆 Competitive Advantage

| Feature | Vatevo | Competitors (Sovos, Avalara, Pagero) |
|---------|--------|--------------------------------------|
| **Integration** | API-first, 5-minute setup | ERP-heavy, months of implementation |
| **Coverage** | Unified adapters for all EU countries | Country-by-country integrations |
| **Developer Experience** | Modern SDKs, comprehensive docs | Legacy APIs, poor documentation |
| **Pricing** | Transparent per-invoice pricing | Complex enterprise contracts |
| **Speed** | <250ms API response time | Slow, batch processing |
| **Compliance** | Built for ViDA from day one | Retrofit existing solutions |

## 💰 Business Opportunity

### Market Size
- **Target Market**: 10,000+ SaaS companies selling into the EU
- **ViDA Mandate**: July 1, 2030 (mandatory for all B2B transactions)
- **Revenue Potential**: €50-500 per company per month
- **Total Addressable Market**: €500M+ annually

### Why Now?
- **ViDA makes compliance mandatory** - not optional
- **SaaS companies are unprepared** - most lack e-invoicing capabilities
- **First-mover advantage** - only API-first solution built for SaaS
- **Regulatory tailwinds** - EU pushing for digital transformation

### Customer Segments
- **SaaS Vendors**: Need to invoice EU customers compliantly
- **Marketplaces**: Must handle B2B transactions across EU
- **ERP Providers**: Want to add e-invoicing to their platforms
- **Fintech Companies**: Require compliance for payment processing

## 📊 Key Features

### ✅ **Implemented (v0.1.0)**
- Multi-tenant API with JWT authentication
- UBL 2.1 + EN16931 XML generation
- Italy FatturaPA integration (complete)
- Germany XRechnung integration (basic)
- France Factur-X integration (basic)
- Real-time webhook system
- Interactive dashboard
- Python & TypeScript SDKs
- Comprehensive API documentation

### 🚧 **In Development (v0.2.0)**
- Peppol integration for Germany/EU
- Poland KSeF support
- Enhanced XRechnung and Factur-X
- WORM-compliant S3 archival
- Advanced analytics and reporting

## 🔒 Security & Compliance

- **SOC 2 Type II** compliance roadmap
- **ISO 27001** security standards
- **GDPR compliant** with EU data residency
- **WORM archival** for immutable invoice storage
- **Multi-tenant isolation** with API key authentication
- **Comprehensive audit logging** for compliance reporting

## 📈 Getting Started

### For Developers
1. **Sign up** at [vatevo.com](https://vatevo.com)
2. **Get your API key** from the dashboard
3. **Install our SDK** (`npm install @vatevo/sdk` or `pip install vatevo-sdk`)
4. **Follow our [quickstart guide](https://docs.vatevo.com/quickstart)**

### For Investors
1. **Review our [pitch deck](https://docs.vatevo.com/investor-materials)**
2. **Try the live demo** at [dashboard.vatevo.com](https://dashboard.vatevo.com)
3. **Explore the API** at [docs.vatevo.com](https://docs.vatevo.com)
4. **Schedule a demo** with our team

## 📞 Contact

**Founder**: Gabriel Lagziel  
**Email**: [contact@vatevo.com](mailto:contact@vatevo.com)  
**LinkedIn**: [https://linkedin.com/company/vatevo](https://linkedin.com/company/vatevo)  
**GitHub**: [https://github.com/gabriellagziel/vatEvo](https://github.com/gabriellagziel/vatEvo)

---

<div align="center">
  <strong>Ready to solve EU e-invoicing compliance?</strong><br>
  <a href="https://vatevo.com">Get Started Today</a> • <a href="https://docs.vatevo.com">Read the Docs</a> • <a href="mailto:contact@vatevo.com">Contact Us</a>
</div>
