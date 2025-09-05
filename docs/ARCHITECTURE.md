# Vatevo MVP Architecture

## System Overview

```
SaaS Client → Vatevo REST API → UBL/EN16931 Engine → Country Adapters
           → Peppol / SDI / PPF → Government Gateway ACK/NACK
           → Secure WORM Archive + Webhooks + Dashboard
```

## Subdomains
- `api.vatevo.com` - Main REST API + Adapters (FastAPI)
- `dashboard.vatevo.com` - Web dashboard (Next.js 15)
- `docs.vatevo.com` - API Documentation (Docusaurus)

## Tech Stack

### Backend
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Database**: PostgreSQL (Supabase managed)
- **Cache/Queue**: Redis (Upstash managed)
- **Storage**: AWS S3 EU (Object Lock/WORM)
- **Auth**: JWT + API Keys per tenant

### Frontend
- **Framework**: Next.js 15 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Radix primitives
- **Design**: SaaS-dark + Stripe-style gradients

### Compliance Adapters
- **Stripe Tax**: VAT calculation
- **Peppol AP**: XRechnung/ZUGFeRD (Germany + EU)
- **SDI**: FatturaPA XML (Italy)
- **PPF/PDP**: Factur-X (France)

### Infrastructure
- **Hosting**: Vercel (frontend), Render (backend)
- **DNS**: DigitalOcean
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## Data Flow

1. **Invoice Creation**:
   - SaaS client sends JSON to POST /invoices
   - Validate business rules and schema
   - Generate UBL 2.1 + EN16931 compliant XML
   - Apply country-specific transformations
   - Store in WORM archive

2. **Government Submission**:
   - Route to appropriate adapter (Peppol/SDI/PPF)
   - Submit to government gateway
   - Process ACK/NACK responses
   - Update invoice status
   - Trigger webhooks

3. **Dashboard Access**:
   - Tenant authentication via JWT
   - Real-time status updates
   - File downloads and retry functionality
   - Audit trail and compliance reporting

## Security Architecture

- **Multi-tenant isolation**: Schema-based + S3 bucket prefixes
- **Data residency**: EU-only infrastructure
- **Encryption**: TLS 1.3, AES-256 at rest
- **Audit**: Comprehensive logging for SOC2/ISO27001
- **WORM**: Immutable invoice archive for compliance
