# Vatevo Deployment Runbook

**Purpose**: Step-by-step production deployment guide  
**Status**: ✅ **Ready for Use**  
**Last Updated**: 2025-09-09T00:45:00Z

## Pre-Deployment Checklist

### Environment Preparation
- [ ] **Database**: PostgreSQL instance provisioned and accessible
- [ ] **Redis**: Redis instance provisioned and accessible
- [ ] **S3**: AWS S3 bucket created with Object Lock enabled
- [ ] **Secrets**: All environment variables configured
- [ ] **DNS**: Domain names configured and pointing to services
- [ ] **SSL**: SSL certificates valid and working

### Code Preparation
- [ ] **Tests**: All tests passing (backend, frontend, marketing)
- [ ] **Migrations**: Database migrations ready
- [ ] **Builds**: All applications build successfully
- [ ] **Health Checks**: Health endpoints implemented and tested
- [ ] **Monitoring**: Monitoring and alerting configured

## Deployment Order

### Phase 1: Database Migration (15 minutes)
1. **Backup Current Data** (if any)
   ```bash
   # Export SQLite data
   sqlite3 vatevo.db .dump > backup.sql
   ```

2. **Initialize Alembic** (if not done)
   ```bash
   cd apps/api
   alembic init alembic
   ```

3. **Generate Migration**
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   ```

4. **Apply Migration**
   ```bash
   alembic upgrade head
   ```

5. **Verify Migration**
   ```bash
   # Test database connection
   python ops/db/check_connection.py
   ```

### Phase 2: API Deployment (20 minutes)
1. **Deploy to Fly.io**
   ```bash
   # Set secrets
   fly secrets set POSTGRES_URL="postgresql://..."
   fly secrets set REDIS_URL="redis://..."
   fly secrets set SECRET_KEY="..."
   fly secrets set AWS_ACCESS_KEY_ID="..."
   fly secrets set AWS_SECRET_ACCESS_KEY="..."
   
   # Deploy
   fly deploy
   ```

2. **Verify API Health**
   ```bash
   # Run smoke tests
   ./ops/api/smoke.sh -u https://api.vatevo.com
   ```

3. **Check Health Endpoints**
   ```bash
   curl https://api.vatevo.com/health/ready
   curl https://api.vatevo.com/health/db
   curl https://api.vatevo.com/docs
   ```

### Phase 3: Frontend Deployment (15 minutes)
1. **Deploy Marketing Site**
   ```bash
   cd apps/marketing
   vercel --prod
   ```

2. **Deploy Dashboard**
   ```bash
   cd apps/dashboard
   vercel --prod
   ```

3. **Configure Domains in Vercel**
   - Set `vatevo.com` as primary
   - Configure `www.vatevo.com` redirect
   - Add `dashboard.vatevo.com`

### Phase 4: DNS Configuration (10 minutes)
1. **Update DNS Records**
   ```
   vatevo.com           A      76.76.21.21
   www.vatevo.com       CNAME  cname.vercel-dns.com
   dashboard.vatevo.com CNAME  cname.vercel-dns.com
   docs.vatevo.com      CNAME  cname.vercel-dns.com
   api.vatevo.com       CNAME  app-ezgnqzzi.fly.dev
   ```

2. **Wait for Propagation** (5-15 minutes)

3. **Verify DNS Resolution**
   ```bash
   dig vatevo.com
   dig api.vatevo.com
   ```

### Phase 5: SSL Verification (5 minutes)
1. **Check SSL Certificates**
   ```bash
   curl -I https://vatevo.com
   curl -I https://api.vatevo.com
   ```

2. **Verify Redirects**
   ```bash
   curl -I https://www.vatevo.com
   # Should redirect to https://vatevo.com
   ```

## Post-Deployment Verification

### Health Checks
```bash
# API Health
curl https://api.vatevo.com/health/ready
curl https://api.vatevo.com/health/db

# Frontend Health
curl https://vatevo.com
curl https://dashboard.vatevo.com

# SSL Verification
openssl s_client -connect vatevo.com:443 -servername vatevo.com
```

### Functional Tests
```bash
# Run full smoke test suite
./ops/api/smoke.sh -u https://api.vatevo.com

# Test marketing site
curl https://vatevo.com/vida
curl https://vatevo.com/compare

# Test dashboard
curl https://dashboard.vatevo.com
```

### Performance Tests
```bash
# API Performance
ab -n 100 -c 10 https://api.vatevo.com/healthz

# Frontend Performance
lighthouse https://vatevo.com --only-categories=performance
```

## Rollback Procedures

### Emergency Rollback (5 minutes)
1. **Stop Traffic**
   - Update DNS to point to maintenance page
   - Or use load balancer to stop traffic

2. **Revert Code**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Redeploy**
   ```bash
   # Redeploy previous version
   fly deploy --image <previous-image>
   vercel --prod
   ```

### Database Rollback (10 minutes)
1. **Stop Application**
   ```bash
   fly scale count 0
   ```

2. **Restore Database**
   ```bash
   # Restore from backup
   psql $POSTGRES_URL < backup.sql
   ```

3. **Revert Migration**
   ```bash
   alembic downgrade -1
   ```

4. **Restart Application**
   ```bash
   fly scale count 1
   ```

## Monitoring & Alerting

### Key Metrics to Monitor
- **API Response Time**: < 250ms P95
- **API Error Rate**: < 1%
- **Database Connections**: < 80% of pool
- **Memory Usage**: < 80% of available
- **Disk Usage**: < 80% of available

### Alerts to Configure
- **API Down**: 5xx errors > 5% for 2 minutes
- **Database Down**: Connection failures > 10% for 1 minute
- **High Latency**: P95 response time > 500ms for 5 minutes
- **High Error Rate**: 4xx/5xx errors > 10% for 2 minutes

### Health Check Endpoints
- **API**: `https://api.vatevo.com/health/ready`
- **Database**: `https://api.vatevo.com/health/db`
- **Marketing**: `https://vatevo.com`
- **Dashboard**: `https://dashboard.vatevo.com`

## Troubleshooting

### Common Issues

#### API Not Starting
```bash
# Check logs
fly logs

# Check secrets
fly secrets list

# Restart service
fly restart
```

#### Database Connection Issues
```bash
# Test connection
python ops/db/check_connection.py

# Check database status
fly ssh console
psql $POSTGRES_URL -c "SELECT 1;"
```

#### Frontend Build Issues
```bash
# Check build logs
vercel logs

# Test build locally
cd apps/marketing && npm run build
cd apps/dashboard && npm run build
```

#### DNS Issues
```bash
# Check DNS propagation
dig vatevo.com
nslookup vatevo.com

# Check from different locations
curl -H "Host: vatevo.com" https://76.76.21.21
```

### Emergency Contacts
- **On-Call Engineer**: [To be assigned]
- **Database Admin**: [To be assigned]
- **Infrastructure Team**: [To be assigned]
- **Security Team**: [To be assigned]

## Success Criteria

### Technical Success
- [ ] All services responding to health checks
- [ ] All smoke tests passing
- [ ] SSL certificates valid
- [ ] DNS resolution working
- [ ] Performance within SLA

### Business Success
- [ ] Marketing site accessible
- [ ] API documentation available
- [ ] Dashboard functional
- [ ] Lead capture working
- [ ] Compliance features operational

---

**Deployment Window**: [To be scheduled]  
**Estimated Duration**: 1-2 hours  
**Rollback Time**: 15 minutes  
**Success Criteria**: All health checks passing, smoke tests green
