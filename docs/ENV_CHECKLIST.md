# Vatevo Environment Variables Checklist

**Generated:** 2025-09-09T00:15:00Z  
**Status:** ⚠️ **Environment Configuration Required**  
**Priority:** **CRITICAL** - Blocking production deployment

## Environment Variables Matrix

### Backend API (`apps/api/`)

| Variable | Purpose | Local | Staging | Production | Status |
|----------|---------|-------|---------|------------|--------|
| `POSTGRES_URL` | PostgreSQL connection | `None` | `postgresql://...` | `postgresql://...` | ⚠️ **Missing** |
| `DATABASE_URL` | Fallback DB connection | `sqlite:///./vatevo.db` | `postgresql://...` | `postgresql://...` | ⚠️ **Placeholder** |
| `DB_POOL_SIZE` | Connection pool size | `10` | `10` | `20` | ✅ **Default** |
| `DB_SSL_MODE` | SSL mode | `prefer` | `prefer` | `require` | ✅ **Default** |
| `REDIS_URL` | Cache/queue connection | `redis://localhost:6379` | `redis://...` | `redis://...` | ⚠️ **Placeholder** |
| `SECRET_KEY` | JWT signing key | `your-secret-key-change-in-production` | `...` | `...` | ⚠️ **Placeholder** |
| `ALGORITHM` | JWT algorithm | `HS256` | `HS256` | `HS256` | ✅ **Default** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry | `30` | `30` | `30` | ✅ **Default** |
| `AWS_ACCESS_KEY_ID` | S3 WORM archival | `None` | `...` | `...` | ⚠️ **Missing** |
| `AWS_SECRET_ACCESS_KEY` | S3 WORM archival | `None` | `...` | `...` | ⚠️ **Missing** |
| `AWS_REGION` | S3 region | `eu-west-1` | `eu-west-1` | `eu-west-1` | ✅ **Default** |
| `S3_BUCKET` | S3 bucket name | `vatevo-invoices` | `vatevo-invoices-staging` | `vatevo-invoices-prod` | ⚠️ **Placeholder** |
| `S3_OBJECT_LOCK` | WORM compliance | `true` | `true` | `true` | ✅ **Default** |
| `STRIPE_API_KEY` | VAT calculation | `None` | `...` | `...` | ⚠️ **Missing** |
| `WEBHOOK_SECRET` | Webhook signing | `webhook-secret-change-in-production` | `...` | `...` | ⚠️ **Placeholder** |
| `ENVIRONMENT` | Environment name | `development` | `staging` | `production` | ✅ **Default** |
| `LOG_LEVEL` | Logging level | `INFO` | `INFO` | `WARNING` | ⚠️ **Missing** |
| `SENTRY_DSN` | Error tracking | `None` | `...` | `...` | ⚠️ **Optional** |

### Dashboard Frontend (`apps/dashboard/`)

| Variable | Purpose | Local | Staging | Production | Status |
|----------|---------|-------|---------|------------|--------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8000` | `https://api-staging.vatevo.com` | `https://api.vatevo.com` | ⚠️ **Default localhost** |

### Marketing Site (`apps/marketing/`)

| Variable | Purpose | Local | Staging | Production | Status |
|----------|---------|-------|---------|------------|--------|
| `NEXT_PUBLIC_GIT_SHA` | Build stamp (Git SHA) | `a472441` | `...` | `...` | ✅ **Working** |
| `NEXT_PUBLIC_BUILD_TIME` | Build stamp (timestamp) | `2025-09-08T22:02:20Z` | `...` | `...` | ✅ **Working** |
| `LEADS_PROVIDER` | Lead capture backend | `airtable` | `airtable` | `supabase` | ⚠️ **Missing** |
| `AIRTABLE_API_KEY` | Airtable integration | `None` | `...` | `None` | ⚠️ **Missing** |
| `AIRTABLE_BASE_ID` | Airtable base ID | `None` | `...` | `None` | ⚠️ **Missing** |
| `AIRTABLE_TABLE_NAME` | Airtable table | `Leads` | `Leads` | `Leads` | ✅ **Default** |
| `SUPABASE_URL` | Supabase integration | `None` | `None` | `...` | ⚠️ **Missing** |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `None` | `None` | `...` | ⚠️ **Missing** |

## Environment Files Required

### 1. Backend API (`.env`)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/vatevo
REDIS_URL=redis://localhost:6379

# Authentication
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 (WORM archival)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-1
S3_BUCKET=vatevo-invoices

# External Services
STRIPE_API_KEY=your-stripe-api-key
WEBHOOK_SECRET=webhook-secret-change-in-production

# Environment
ENVIRONMENT=development
```

### 2. Dashboard Frontend (`.env.local`)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Marketing Site (`.env.local`)
```bash
# Build Stamps (auto-generated)
NEXT_PUBLIC_GIT_SHA=a472441
NEXT_PUBLIC_BUILD_TIME=2025-09-08T22:02:20Z

# Lead Capture
LEADS_PROVIDER=airtable
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Leads

# Alternative: Supabase
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Production Environment Setup

### 1. Database (PostgreSQL)
```bash
# Production database URL format
DATABASE_URL=postgresql://username:password@host:port/database

# Recommended providers:
# - Supabase (managed PostgreSQL)
# - AWS RDS (PostgreSQL)
# - Google Cloud SQL (PostgreSQL)
```

### 2. Redis (Cache/Queue)
```bash
# Production Redis URL format
REDIS_URL=redis://username:password@host:port/database

# Recommended providers:
# - Upstash (managed Redis)
# - AWS ElastiCache (Redis)
# - Google Cloud Memorystore (Redis)
```

### 3. AWS S3 (WORM Archival)
```bash
# S3 configuration for compliance
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
S3_BUCKET=vatevo-invoices-prod

# S3 Object Lock configuration required for WORM
# - Enable Object Lock on bucket
# - Set retention period (10 years for compliance)
# - Configure legal hold policies
```

### 4. Stripe (VAT Calculation)
```bash
# Stripe Tax API for VAT calculation
STRIPE_API_KEY=sk_live_...

# Required for:
# - VAT rate calculation
# - Tax amount validation
# - Country-specific tax rules
```

## Security Considerations

### 1. Secret Management
- [ ] **Never commit secrets** to version control
- [ ] **Use environment variables** for all sensitive data
- [ ] **Rotate secrets regularly** (every 90 days)
- [ ] **Use different secrets** for each environment

### 2. Database Security
- [ ] **Use strong passwords** (20+ characters)
- [ ] **Enable SSL/TLS** for database connections
- [ ] **Restrict network access** to database
- [ ] **Enable audit logging** for compliance

### 3. API Security
- [ ] **Use strong JWT secrets** (32+ characters)
- [ ] **Set appropriate token expiry** (30 minutes)
- [ ] **Implement rate limiting** (per tenant)
- [ ] **Enable CORS** only for allowed origins

### 4. External Services
- [ ] **Use least privilege** for AWS IAM roles
- [ ] **Enable MFA** for all service accounts
- [ ] **Monitor API usage** and costs
- [ ] **Set up alerts** for unusual activity

## Deployment Configuration

### 1. Vercel (Frontend)
```bash
# Vercel environment variables
# Set in Vercel dashboard → Project → Settings → Environment Variables

# Marketing site
NEXT_PUBLIC_GIT_SHA=a472441
NEXT_PUBLIC_BUILD_TIME=2025-09-08T22:02:20Z
LEADS_PROVIDER=supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Dashboard
NEXT_PUBLIC_API_URL=https://api.vatevo.com
```

### 2. Fly.io (Backend)
```bash
# Fly.io secrets (set via fly secrets)
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set REDIS_URL="redis://..."
fly secrets set SECRET_KEY="..."
fly secrets set AWS_ACCESS_KEY_ID="..."
fly secrets set AWS_SECRET_ACCESS_KEY="..."
fly secrets set STRIPE_API_KEY="..."
```

## Validation Checklist

### Local Development
- [ ] All services start without errors
- [ ] Database migrations run successfully
- [ ] API endpoints respond correctly
- [ ] Frontend connects to backend
- [ ] All tests pass

### Staging Environment
- [ ] All environment variables set
- [ ] External services configured
- [ ] SSL certificates valid
- [ ] Health checks pass
- [ ] Performance acceptable

### Production Environment
- [ ] All secrets properly configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting active
- [ ] Security scanning complete
- [ ] Load testing performed

## Next Actions

### Immediate (Today)
1. **Create `.env.example` files** for all services
2. **Set up PostgreSQL database** (Supabase recommended)
3. **Configure Redis** (Upstash recommended)
4. **Set up AWS S3 bucket** with Object Lock

### Short-term (This Week)
1. **Configure production environment** variables
2. **Set up Stripe Tax API** integration
3. **Deploy API to Fly.io** with proper secrets
4. **Deploy frontend to Vercel** with environment variables

### Medium-term (Next 2 Weeks)
1. **Implement secret rotation** automation
2. **Set up monitoring** and alerting
3. **Configure backup** and disaster recovery
4. **Perform security audit** and penetration testing

---

**Critical Blockers**: Database migration, Redis setup, AWS S3 configuration  
**Estimated Time**: 4-6 hours for basic setup, 2-3 days for production readiness
