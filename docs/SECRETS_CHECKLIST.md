# Vatevo Secrets Checklist

**Purpose**: Required secrets for production deployment  
**Status**: ⚠️ **Configuration Required**  
**Priority**: **CRITICAL** - Blocking production deployment

## GitHub Actions Secrets

### Required Secrets
| Secret Name | Purpose | Required For |
|-------------|---------|--------------|
| `POSTGRES_URL` | Database connection | API deployment |
| `REDIS_URL` | Cache/queue connection | API deployment |
| `AWS_ACCESS_KEY_ID` | S3 WORM archival | API deployment |
| `AWS_SECRET_ACCESS_KEY` | S3 WORM archival | API deployment |
| `STRIPE_API_KEY` | VAT calculation | API deployment |
| `AUTH_SECRET` | JWT signing key | API deployment |
| `API_KEYS_SIGNING_KEY` | API key signing | API deployment |
| `SENTRY_DSN` | Error tracking | All services |
| `VERCEL_TOKEN` | Vercel deployment | Frontend deployment |
| `FLY_API_TOKEN` | Fly.io deployment | API deployment |

## Fly.io Secrets

### API Service Secrets
| Secret Name | Purpose | Environment |
|-------------|---------|-------------|
| `POSTGRES_URL` | Database connection | Production |
| `REDIS_URL` | Cache/queue connection | Production |
| `AWS_ACCESS_KEY_ID` | S3 WORM archival | Production |
| `AWS_SECRET_ACCESS_KEY` | S3 WORM archival | Production |
| `STRIPE_API_KEY` | VAT calculation | Production |
| `AUTH_SECRET` | JWT signing key | Production |
| `API_KEYS_SIGNING_KEY` | API key signing | Production |
| `S3_BUCKET` | S3 bucket name | Production |
| `S3_REGION` | S3 region | Production |
| `S3_OBJECT_LOCK` | WORM compliance | Production |
| `WEBHOOK_SECRET` | Webhook signing | Production |
| `LOG_LEVEL` | Logging level | Production |
| `SENTRY_DSN` | Error tracking | Production |

## Vercel Environment Variables

### Marketing Site
| Variable Name | Purpose | Environment |
|---------------|---------|-------------|
| `NEXT_PUBLIC_BUILD_STAMP` | Build timestamp | Production |
| `NEXT_PUBLIC_GIT_SHA` | Git commit hash | Production |
| `LEADS_PROVIDER` | Lead capture backend | Production |
| `SUPABASE_URL` | Lead storage | Production |
| `SUPABASE_ANON_KEY` | Lead storage key | Production |

### Dashboard Site
| Variable Name | Purpose | Environment |
|---------------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Production |
| `AUTH_PROVIDER_URL` | Authentication provider | Production |
| `AUTH_PROVIDER_CLIENT_ID` | Auth client ID | Production |
| `AUTH_PROVIDER_CLIENT_SECRET` | Auth client secret | Production |

## Secret Management Best Practices

### 1. Secret Generation
- **JWT Secrets**: Use 32+ character random strings
- **API Keys**: Use cryptographically secure random generation
- **Database URLs**: Include SSL parameters for production
- **S3 Keys**: Use IAM roles when possible

### 2. Secret Rotation
- **JWT Secrets**: Rotate every 90 days
- **API Keys**: Rotate every 180 days
- **Database Passwords**: Rotate every 90 days
- **S3 Keys**: Rotate every 90 days

### 3. Secret Storage
- **GitHub Actions**: Use encrypted secrets
- **Fly.io**: Use `fly secrets set`
- **Vercel**: Use environment variables
- **Local Development**: Use `.env.local` files

### 4. Secret Validation
- **Required Secrets**: Validate presence before deployment
- **Secret Format**: Validate format (URLs, keys, etc.)
- **Secret Permissions**: Verify permissions are correct
- **Secret Rotation**: Track rotation dates

## Environment-Specific Requirements

### Development
- **Database**: SQLite (no secrets required)
- **Redis**: Local instance (no secrets required)
- **S3**: Mock or development bucket
- **Auth**: Development keys

### Staging
- **Database**: PostgreSQL with SSL
- **Redis**: Staging instance
- **S3**: Staging bucket with Object Lock
- **Auth**: Staging keys

### Production
- **Database**: Production PostgreSQL with SSL
- **Redis**: Production instance
- **S3**: Production bucket with WORM compliance
- **Auth**: Production keys

## Secret Validation Script

### Pre-Deployment Check
```bash
#!/bin/bash
# Validate required secrets are present

REQUIRED_SECRETS=(
    "POSTGRES_URL"
    "REDIS_URL"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AUTH_SECRET"
    "API_KEYS_SIGNING_KEY"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if [[ -z "${!secret:-}" ]]; then
        echo "❌ Missing required secret: $secret"
        exit 1
    else
        echo "✅ Secret present: $secret"
    fi
done

echo "🎉 All required secrets present"
```

## Security Considerations

### 1. Secret Exposure Prevention
- **Never log secrets** in application logs
- **Use environment variables** for all secrets
- **Validate secret presence** before use
- **Rotate secrets regularly**

### 2. Secret Access Control
- **Principle of least privilege** for secret access
- **Audit secret usage** regularly
- **Revoke unused secrets** immediately
- **Monitor secret access** patterns

### 3. Secret Backup
- **Backup secret values** securely
- **Document secret purposes** clearly
- **Maintain secret inventory** updated
- **Plan secret recovery** procedures

## Next Steps

### Immediate Actions
1. **Generate Secrets**: Create all required secrets
2. **Set Secrets**: Configure secrets in all platforms
3. **Validate Secrets**: Test secret access
4. **Document Secrets**: Update this checklist

### Ongoing Maintenance
1. **Monitor Secret Usage**: Track secret access
2. **Rotate Secrets**: Follow rotation schedule
3. **Audit Secrets**: Regular security audits
4. **Update Documentation**: Keep checklist current

---

**Last Updated**: 2025-09-09T01:00:00Z  
**Next Review**: Before each deployment  
**Owner**: DevOps Team
