# Vatevo MVP Task Board

## Phase 1: Core Infrastructure
- [x] Create monorepo structure with Turborepo
- [ ] Set up FastAPI backend with basic structure
- [ ] Create PostgreSQL schema and models
- [ ] Implement JWT authentication and API key management
- [ ] Set up Redis for caching and queuing
- [ ] Create basic tenant isolation

## Phase 2: Core API
- [ ] Implement POST /invoices endpoint
- [ ] Implement GET /invoices/{id} endpoint  
- [ ] Implement POST /validate endpoint
- [ ] Add webhook system (invoice.accepted, invoice.rejected, submission.failed)
- [ ] Generate OpenAPI 3.1 specification
- [ ] Add request/response validation

## Phase 3: Compliance Engine
- [ ] Implement EN16931 + UBL 2.1 generation
- [ ] Create business rules validation engine
- [ ] Add VAT calculation integration with Stripe Tax
- [ ] Implement WORM archival to S3 with Object Lock
- [ ] Add digital signature support

## Phase 4: Country Adapters
- [ ] Peppol adapter for XRechnung (Germany + EU generic)
- [ ] SDI adapter for FatturaPA XML (Italy)
- [ ] PPF/PDP adapter for Factur-X (France)
- [ ] Government gateway submission handlers
- [ ] ACK/NACK processing

## Phase 5: Dashboard Frontend
- [ ] Set up Next.js 15 with TypeScript
- [ ] Implement authentication flow
- [ ] Create invoice listing with search/filters
- [ ] Add retry failed submissions functionality
- [ ] Implement file download (UBL/PDF)
- [ ] Create webhook testing tool
- [ ] Add dashboard analytics

## Phase 6: Documentation
- [ ] Set up Docusaurus for API docs
- [ ] Auto-generate OpenAPI documentation
- [ ] Create developer onboarding guide
- [ ] Add compliance reference documentation
- [ ] Create tenant setup guide

## Phase 7: Testing
- [ ] Unit tests for all core modules
- [ ] Integration tests for API endpoints
- [ ] Golden file tests for UBL/XML generation
- [ ] Peppol/SDI sandbox integration tests
- [ ] End-to-end dashboard tests
- [ ] Performance tests (250ms P95 target)

## Phase 8: Deployment & Infrastructure
- [ ] Set up Terraform IaC configuration
- [ ] Configure GitHub Actions CI/CD
- [ ] Deploy to Vercel (frontend) and Render (backend)
- [ ] Set up Supabase PostgreSQL
- [ ] Configure Upstash Redis
- [ ] Set up AWS S3 EU with Object Lock
- [ ] Configure DigitalOcean DNS
- [ ] Add health checks and monitoring

## Phase 9: Security & Compliance
- [ ] Implement GDPR compliance measures
- [ ] Add SOC2/ISO27001 structure
- [ ] Set up audit logging
- [ ] Implement rate limiting
- [ ] Add HMAC webhook signatures
- [ ] Security testing and penetration testing prep
