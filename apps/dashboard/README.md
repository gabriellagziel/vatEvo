# Vatevo Dashboard

The Vatevo Dashboard is a modern, interactive web application built with Next.js 15 and TypeScript that provides a comprehensive interface for managing EU e-invoicing compliance.

## Features

- **Invoice Management**: Create, validate, and track invoices across all EU countries
- **Real-time Status Updates**: Live webhook integration for instant status changes
- **Multi-tenant Support**: Secure tenant isolation with API key authentication
- **Country Adapters**: Support for Italy (FatturaPA), Germany (XRechnung), France (Factur-X)
- **Compliance Monitoring**: Track submission status and government responses
- **File Downloads**: Download UBL XML, PDF invoices, and compliance reports

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **API Integration**: Custom Vatevo API client

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Vatevo API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your VATEVO_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.vatevo.com
VATEVO_API_KEY=your_api_key_here
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests

## Features Overview

### Invoice Creation
- Interactive form with real-time validation
- Support for all EU countries and formats
- Line item management with tax calculations
- Supplier and customer information management

### Compliance Tracking
- Real-time status updates via webhooks
- Government submission tracking
- Error handling and retry mechanisms
- Audit trail and compliance reporting

### Multi-tenant Architecture
- Secure tenant isolation
- API key-based authentication
- Role-based access control
- Tenant-specific settings and configurations

## API Integration

The dashboard integrates with the Vatevo API to provide:

- **Invoice CRUD operations** (Create, Read, Update, Delete)
- **Real-time webhook processing** for status updates
- **File generation and download** (UBL XML, PDF)
- **Compliance validation** and error reporting
- **Multi-country support** with country-specific adapters

## Deployment

The dashboard is deployed on Vercel with automatic deployments from the main branch.

**Live URL**: [https://dashboard.vatevo.com](https://dashboard.vatevo.com)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- **Documentation**: [https://docs.vatevo.com](https://docs.vatevo.com)
- **API Reference**: [https://api.vatevo.com/docs](https://api.vatevo.com/docs)
- **Support Email**: [support@vatevo.com](mailto:support@vatevo.com)

## License

MIT License - see [LICENSE](../../LICENSE) for details.