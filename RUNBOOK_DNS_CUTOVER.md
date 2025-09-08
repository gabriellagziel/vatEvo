# Vatevo DNS Cutover Runbook

**Purpose**: Step-by-step DNS migration from Squarespace to Vatevo infrastructure  
**Status**: ⚠️ **Ready for Execution**  
**Last Updated**: 2025-09-09T00:45:00Z

## Pre-Cutover Preparation

### Current State Verification
- [ ] **Current DNS**: Verify all domains pointing to Squarespace
- [ ] **TTL Values**: Check current TTL settings (recommend 300s for cutover)
- [ ] **Backup Records**: Document current DNS configuration
- [ ] **Service Readiness**: Verify all Vatevo services are ready

### Service Readiness Checklist
- [ ] **API**: Deployed and responding at `https://app-ezgnqzzi.fly.dev`
- [ ] **Marketing**: Deployed and responding at Vercel URL
- [ ] **Dashboard**: Deployed and responding at Vercel URL
- [ ] **SSL**: All services have valid SSL certificates
- [ ] **Health Checks**: All health endpoints responding

## Cutover Procedure

### Phase 1: TTL Reduction (24 hours before)
1. **Reduce TTL Values**
   ```
   # Set TTL to 300 seconds (5 minutes) for faster propagation
   vatevo.com           A      198.49.23.144    TTL=300
   www.vatevo.com       CNAME  ext-sq.squarespace.com  TTL=300
   ```

2. **Wait 24 Hours** for TTL to take effect globally

### Phase 2: DNS Record Update (Cutover Day)

#### Step 1: Update Apex Domain (5 minutes)
```bash
# Update vatevo.com A record
vatevo.com           A      76.76.21.21        TTL=300
```

#### Step 2: Update Subdomains (5 minutes)
```bash
# Update CNAME records
www.vatevo.com       CNAME  cname.vercel-dns.com      TTL=300
dashboard.vatevo.com CNAME  cname.vercel-dns.com      TTL=300
docs.vatevo.com      CNAME  cname.vercel-dns.com      TTL=300
api.vatevo.com       CNAME  app-ezgnqzzi.fly.dev      TTL=300
```

#### Step 3: Add IPv6 Support (Optional)
```bash
# Add IPv6 AAAA record
vatevo.com           AAAA   2600:1f18:1c5e:2c00:4c4c:4c4c:4c4c:4c4c  TTL=300
```

#### Step 4: Add CAA Records (Optional)
```bash
# Add Certificate Authority Authorization
vatevo.com           CAA    0 issue "letsencrypt.org"  TTL=300
vatevo.com           CAA    0 issue "vercel.com"       TTL=300
```

### Phase 3: Vercel Configuration (10 minutes)
1. **Set Primary Domain**
   - Go to Vercel Dashboard → Project Settings → Domains
   - Set `vatevo.com` as Primary domain

2. **Configure Redirects**
   - Set `www.vatevo.com` to redirect to `vatevo.com`
   - Configure other subdomains as needed

3. **Verify SSL**
   - Check that SSL certificates are issued
   - Verify certificate validity

### Phase 4: Fly.io Configuration (5 minutes)
1. **Add Custom Domain**
   - Go to Fly.io Dashboard → App `app-ezgnqzzi`
   - Add `api.vatevo.com` as custom domain
   - Copy the DNS target provided

2. **Update DNS Record**
   - Use the DNS target from Fly.io (usually CNAME to `app-ezgnqzzi.fly.dev`)

## Verification Process

### Immediate Verification (5 minutes)
```bash
# Check DNS resolution
dig vatevo.com
dig www.vatevo.com
dig dashboard.vatevo.com
dig api.vatevo.com

# Expected results:
# vatevo.com → 76.76.21.21
# www.vatevo.com → cname.vercel-dns.com
# dashboard.vatevo.com → cname.vercel-dns.com
# api.vatevo.com → app-ezgnqzzi.fly.dev
```

### HTTP/HTTPS Verification (10 minutes)
```bash
# Test HTTP responses
curl -I https://vatevo.com
curl -I https://www.vatevo.com
curl -I https://dashboard.vatevo.com
curl -I https://api.vatevo.com/healthz

# Expected: HTTP/2 200 with valid SSL certificates
```

### Functional Verification (15 minutes)
```bash
# Test marketing site
curl https://vatevo.com/vida
curl https://vatevo.com/compare

# Test API
curl https://api.vatevo.com/docs
curl https://api.vatevo.com/health/ready

# Test redirects
curl -I https://www.vatevo.com
# Should return 301/302 redirect to https://vatevo.com
```

### Global Verification (30 minutes)
```bash
# Test from multiple locations
# Use online tools like:
# - https://www.whatsmydns.net/
# - https://dnschecker.org/
# - https://www.dnswatch.info/

# Verify from different geographic locations
```

## Rollback Procedure

### Emergency Rollback (5 minutes)
1. **Revert DNS Records**
   ```bash
   # Revert to Squarespace
   vatevo.com           A      198.49.23.144    TTL=300
   www.vatevo.com       CNAME  ext-sq.squarespace.com  TTL=300
   dashboard.vatevo.com CNAME  ext-sq.squarespace.com  TTL=300
   docs.vatevo.com      CNAME  ext-sq.squarespace.com  TTL=300
   # Remove api.vatevo.com or point to maintenance page
   ```

2. **Wait for Propagation** (5-15 minutes)

3. **Verify Rollback**
   ```bash
   dig vatevo.com
   curl https://vatevo.com
   ```

### Partial Rollback (10 minutes)
1. **Identify Problem Domain**
   - Check which specific domain is causing issues

2. **Revert Specific Domain**
   ```bash
   # Example: revert only dashboard
   dashboard.vatevo.com CNAME  ext-sq.squarespace.com  TTL=300
   ```

3. **Keep Other Domains**
   - Leave working domains pointing to Vatevo services

## Monitoring During Cutover

### Key Metrics to Watch
- **DNS Propagation**: Check global DNS propagation
- **SSL Certificate Status**: Monitor certificate issuance
- **HTTP Response Codes**: Watch for 5xx errors
- **Response Times**: Monitor for performance degradation
- **Error Rates**: Track error rates across all services

### Alerting Thresholds
- **DNS Propagation**: < 80% after 15 minutes
- **SSL Issues**: Certificate errors > 5%
- **HTTP Errors**: 5xx errors > 10%
- **Response Time**: P95 > 1 second

### Monitoring Tools
- **DNS Propagation**: https://www.whatsmydns.net/
- **SSL Monitoring**: https://www.ssllabs.com/ssltest/
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics, Fly.io Metrics

## Troubleshooting

### Common Issues

#### DNS Not Propagating
```bash
# Check TTL values
dig vatevo.com

# Flush local DNS cache
sudo dscacheutil -flushcache  # macOS
sudo systemctl flush-dns      # Linux

# Check from different DNS servers
dig @8.8.8.8 vatevo.com
dig @1.1.1.1 vatevo.com
```

#### SSL Certificate Issues
```bash
# Check certificate status
openssl s_client -connect vatevo.com:443 -servername vatevo.com

# Check certificate chain
curl -I https://vatevo.com
```

#### Service Not Responding
```bash
# Check service health
curl https://api.vatevo.com/health/ready
curl https://api.vatevo.com/health/db

# Check service logs
fly logs  # For API
vercel logs  # For frontend
```

#### Redirect Not Working
```bash
# Test redirect manually
curl -I https://www.vatevo.com

# Check Vercel configuration
# Go to Vercel Dashboard → Domains → Redirects
```

### Emergency Contacts
- **DNS Administrator**: [To be assigned]
- **Infrastructure Team**: [To be assigned]
- **On-Call Engineer**: [To be assigned]
- **Squarespace Support**: [If rollback needed]

## Success Criteria

### Technical Success
- [ ] All domains resolving to correct targets
- [ ] All services responding with 200 OK
- [ ] SSL certificates valid and working
- [ ] Redirects functioning correctly
- [ ] Performance within acceptable limits

### Business Success
- [ ] Marketing site accessible and functional
- [ ] API documentation available
- [ ] Dashboard accessible and functional
- [ ] Lead capture working
- [ ] No customer impact

## Post-Cutover Tasks

### Immediate (1 hour)
- [ ] Monitor all services for 1 hour
- [ ] Verify all functionality works
- [ ] Check error rates and performance
- [ ] Document any issues encountered

### Short-term (24 hours)
- [ ] Monitor DNS propagation globally
- [ ] Check SSL certificate renewal
- [ ] Verify all integrations working
- [ ] Update monitoring dashboards

### Long-term (1 week)
- [ ] Increase TTL values to normal (3600s)
- [ ] Remove old DNS records
- [ ] Update documentation
- [ ] Conduct post-mortem if issues occurred

---

**Cutover Window**: [To be scheduled]  
**Estimated Duration**: 1-2 hours  
**Rollback Time**: 15 minutes  
**Success Criteria**: All domains working, no customer impact
