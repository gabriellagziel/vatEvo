# Changelog

All notable changes to the Vatevo platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Performance testing with K6 load testing
- Comprehensive backup and disaster recovery procedures
- Compliance adapter stubs for Peppol, KSeF, and PPF
- S3 WORM compliance for invoice archival

### Changed
- Updated security checklist with API key management
- Enhanced DNS SSL report with docs subdomain binding

### Fixed
- Rate limiting fallback when Redis is not available
- Webhook signature verification edge cases

## [0.1.0-rc2] - 2025-09-09

### Added
- **Observability & Monitoring**
  - Sentry integration for error tracking and performance monitoring
  - Structured logging with correlation ID middleware
  - Uptime monitoring with GitHub Issues integration
  - Performance baselines with K6 load testing

- **Security & Compliance**
  - API key lifecycle management (create, list, revoke, rotate)
  - Rate limiting with Redis-backed token bucket algorithm
  - Webhook HMAC-SHA256 signing with replay protection
  - Comprehensive security hardening checklist

- **Developer Experience**
  - TypeScript SDK (`@vatevo/sdk`) with full API coverage
  - Python SDK (`vatevo-sdk`) with Pydantic models
  - Express.js and FastAPI integration examples
  - Complete Postman collection for API testing
  - 5-minute quickstart guide

- **Documentation & Support**
  - Docusaurus-based documentation site
  - Interactive API reference with OpenAPI
  - Complete error codes reference
  - Comprehensive webhook implementation guide
  - Country and format support matrix

- **Operations & Reliability**
  - PostgreSQL migration with Alembic
  - S3 WORM compliance for invoice archival
  - Multi-level health monitoring endpoints
  - Automated API smoke tests
  - Disaster recovery runbook

### Changed
- Enhanced OpenAPI schema with tags and descriptions
- Improved webhook delivery with retry logic
- Updated security checklist with new requirements
- Enhanced DNS SSL report with docs subdomain steps

### Fixed
- Correlation ID middleware PII redaction
- Webhook signature verification timestamp validation
- API key rotation audit logging
- Rate limiting error handling

## [0.1.0] - 2025-09-09

### Added
- **Core Platform**
  - Multi-tenant SaaS architecture with API key authentication
  - RESTful API with 7 core endpoints
  - Real-time dashboard for invoice management
  - Professional marketing site

- **EU Compliance Engine**
  - Multi-country support (Italy, Germany, France, Spain, Netherlands)
  - Multiple format support (UBL 2.1, EN16931, FatturaPA, XRechnung, Factur-X)
  - Gateway integration (SDI, Peppol, PPF)
  - Comprehensive validation and error handling

- **Developer Experience**
  - Complete API documentation
  - Webhook support for real-time notifications
  - Health check endpoints
  - Error handling and retry logic

- **Infrastructure**
  - Fly.io deployment for API
  - Vercel deployment for frontend
  - PostgreSQL database with SQLAlchemy
  - AWS S3 storage for invoice archival

### Changed
- Initial release with core functionality
- Basic error handling and validation
- Simple authentication system

### Fixed
- N/A (initial release)

## [0.0.1] - 2025-09-08

### Added
- Initial project setup
- Basic FastAPI application structure
- SQLite database for development
- Basic invoice models and schemas
- Initial compliance validation logic

### Changed
- N/A (initial setup)

### Fixed
- N/A (initial setup)

---

## Legend

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
