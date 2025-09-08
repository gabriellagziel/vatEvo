# Vatevo DNS & SSL Configuration Report

**Generated:** 2025-09-09T00:15:00Z  
**Status:** ⚠️ **DNS Configuration Required**  
**Priority:** **CRITICAL** - Blocking production access

## Current DNS Status

### Domain Resolution Check
```bash
# Current DNS records (as of 2025-09-09T00:15:00Z)
dig +short A vatevo.com
# Returns: 198.49.23.144, 198.49.23.145 (Squarespace)

dig +short CNAME www.vatevo.com  
# Returns: ext-sq.squarespace.com (Squarespace)

dig +short CNAME dashboard.vatevo.com
# Returns: ext-sq.squarespace.com (Squarespace)

dig +short CNAME docs.vatevo.com
# Returns: ext-sq.squarespace.com (Squarespace)

dig +short CNAME api.vatevo.com
# Returns: NXDOMAIN (Not configured)
```

**Status**: ❌ **ALL DOMAINS STILL POINTING TO SQUARESPACE**

## Required DNS Records

### 1. Vercel Domains (Marketing, Dashboard, Docs)

**Final DNS Records to Create:**
```
# Apex domain (A record for Vercel)
vatevo.com           A      76.76.21.21

# Subdomains (CNAME to Vercel)
www.vatevo.com       CNAME  cname.vercel-dns.com
dashboard.vatevo.com CNAME  cname.vercel-dns.com
docs.vatevo.com      CNAME  cname.vercel-dns.com

# API domain (CNAME to Fly.io)
api.vatevo.com       CNAME  app-ezgnqzzi.fly.dev

# IPv6 support (if available)
vatevo.com           AAAA   2600:1f18:1c5e:2c00:4c4c:4c4c:4c4c:4c4c

# CAA records for SSL certificate authority
vatevo.com           CAA    0 issue "letsencrypt.org"
vatevo.com           CAA    0 issue "vercel.com"

# HSTS header (configured in Vercel)
# Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Vercel UI Configuration Required:**
1. **Project**: `vat-evo-marketing` (ID: `prj_MRCZDXWDTRRTyRRfHJ5ornncrIFv`)
2. **Settings → Domains**:
   - Set `vatevo.com` as **Primary** domain
   - Set `www.vatevo.com` to **Redirect to apex**
   - Add `dashboard.vatevo.com` and `docs.vatevo.com`

## Vercel Bind Steps

### 1. Connect Custom Domains
1. **Go to Vercel Dashboard** → Project `vat-evo-marketing` → Settings → Domains
2. **Add Domain**: Click "Add Domain" and enter `vatevo.com`
3. **Set as Primary**: Click the star icon next to `vatevo.com` to make it primary
4. **Add Subdomains**: Add `www.vatevo.com`, `dashboard.vatevo.com`, `docs.vatevo.com`

### 2. Configure Redirects
1. **www Redirect**: In Domains settings, set `www.vatevo.com` to redirect to `vatevo.com`
2. **HTTPS Redirect**: Ensure "Redirect HTTP to HTTPS" is enabled
3. **Trailing Slash**: Configure trailing slash behavior as needed

### 3. SSL Certificate
1. **Automatic SSL**: Vercel will automatically provision SSL certificates
2. **Certificate Status**: Check that all domains show "Valid" status
3. **Renewal**: Certificates auto-renew every 90 days

### 4. Verify Configuration
1. **DNS Check**: Verify DNS records are pointing to Vercel
2. **SSL Test**: Test HTTPS access to all domains
3. **Redirect Test**: Verify www redirects work correctly
4. **Performance**: Check Core Web Vitals scores

## Docs Subdomain Binding

### 1. Connect docs.vatevo.com
1. **Go to Vercel Dashboard** → Project `vat-evo-marketing` → Settings → Domains
2. **Add Domain**: Click "Add Domain" and enter `docs.vatevo.com`
3. **Configure Routing**: Set up routing to serve docs content
4. **SSL Certificate**: Vercel will automatically provision SSL certificate

### 2. Configure Docs Routing
1. **Build Settings**: Ensure docs build command is `npm run build`
2. **Output Directory**: Set to `apps/docs/build`
3. **Root Directory**: Set to `apps/docs`
4. **Environment Variables**: Configure any required env vars

### 3. Verify Docs Deployment
1. **DNS Resolution**: `dig docs.vatevo.com` should return Vercel IPs
2. **HTTPS Access**: `curl -I https://docs.vatevo.com` should return 200 OK
3. **Content Loading**: Verify all documentation pages load correctly
4. **API Reference**: Test embedded OpenAPI documentation

### 4. Docs Subdomain DNS Record
```
# Add to registrar DNS
docs.vatevo.com       CNAME  cname.vercel-dns.com
```

### 2. Fly.io Domain (API)

**Fly.io Configuration Required:**
1. **App**: `app-ezgnqzzi`
2. **Custom Domains**: Add `api.vatevo.com`
3. **DNS Target**: Copy the CNAME target from Fly.io dashboard

**Expected DNS Record:**
```
api.vatevo.com       CNAME  app-ezgnqzzi.fly.dev
```

## SSL Certificate Status

### Vercel SSL
- **Status**: ⚠️ **Pending DNS update**
- **Provider**: Vercel (automatic)
- **Coverage**: All Vercel domains once DNS is updated
- **Verification**: Will be automatic after DNS propagation

### Fly.io SSL
- **Status**: ⚠️ **Pending domain configuration**
- **Provider**: Fly.io (Let's Encrypt)
- **Coverage**: `api.vatevo.com` once domain is added
- **Verification**: Check Fly.io dashboard for TLS status

## Verification Commands

### DNS Verification
```bash
# Check A record for apex domain
dig +short A vatevo.com
# Expected: 76.76.21.21

# Check CNAME records for subdomains
dig +short CNAME www.vatevo.com
dig +short CNAME dashboard.vatevo.com
dig +short CNAME docs.vatevo.com
# Expected: cname.vercel-dns.com

# Check API domain
dig +short CNAME api.vatevo.com
# Expected: app-ezgnqzzi.fly.dev
```

### HTTP/HTTPS Verification
```bash
# Check HTTP status and SSL
curl -I https://vatevo.com
curl -I https://www.vatevo.com
curl -I https://dashboard.vatevo.com
curl -I https://docs.vatevo.com
curl -I https://api.vatevo.com/healthz

# Expected: HTTP/2 200 with valid SSL certificates
```

## Step-by-Step Implementation

### Phase 1: Vercel Domains (30 minutes)
1. **Update DNS at Registrar**:
   - Remove existing Squarespace records
   - Add A record: `vatevo.com → 76.76.21.21`
   - Add CNAME records for all subdomains

2. **Configure Vercel UI**:
   - Set `vatevo.com` as primary domain
   - Configure `www.vatevo.com` redirect
   - Add remaining subdomains

3. **Wait for Propagation** (5-15 minutes)

### Phase 2: Fly.io Domain (15 minutes)
1. **Add Custom Domain in Fly.io**:
   - Go to app `app-ezgnqzzi`
   - Add `api.vatevo.com` as custom domain
   - Copy the DNS target provided

2. **Update DNS at Registrar**:
   - Add CNAME record: `api.vatevo.com → <fly-target>`

3. **Wait for TLS Certificate** (5-10 minutes)

### Phase 3: Verification (10 minutes)
1. **Run verification commands** (above)
2. **Test all URLs** in browser
3. **Check SSL certificates** are valid
4. **Verify redirects** work correctly

## Expected Results

### After DNS Update
```bash
# DNS Resolution
vatevo.com           → 76.76.21.21 (Vercel)
www.vatevo.com       → cname.vercel-dns.com (Vercel)
dashboard.vatevo.com → cname.vercel-dns.com (Vercel)
docs.vatevo.com      → cname.vercel-dns.com (Vercel)
api.vatevo.com       → app-ezgnqzzi.fly.dev (Fly.io)

# HTTP Status
https://vatevo.com           → 200 OK (Marketing site)
https://www.vatevo.com       → 301 → https://vatevo.com
https://dashboard.vatevo.com → 200 OK (Dashboard)
https://docs.vatevo.com      → 200 OK (API docs)
https://api.vatevo.com/healthz → 200 OK (API health)
```

### SSL Certificates
- **Vercel**: Automatic Let's Encrypt certificates
- **Fly.io**: Automatic Let's Encrypt certificates
- **Validity**: 90 days with auto-renewal
- **Coverage**: All domains and subdomains

## Troubleshooting

### Common Issues
1. **DNS Propagation Delay**: Wait 15-30 minutes for global propagation
2. **CNAME Conflicts**: Ensure no conflicting A records exist
3. **SSL Certificate Pending**: Wait 5-10 minutes after DNS update
4. **Redirect Not Working**: Check Vercel UI configuration

### Verification Tools
- **DNS**: `dig`, `nslookup`, `host`
- **SSL**: `openssl s_client`, browser dev tools
- **HTTP**: `curl`, `wget`, browser network tab

## Success Criteria

### DNS Resolution
- [ ] All domains resolve to correct targets
- [ ] No NXDOMAIN errors
- [ ] CNAME records point to correct services

### SSL Certificates
- [ ] All HTTPS URLs return valid certificates
- [ ] No SSL warnings in browsers
- [ ] Certificate chain is complete

### HTTP Responses
- [ ] All services return 200 OK
- [ ] Redirects work correctly
- [ ] Health endpoints respond properly

### Performance
- [ ] DNS resolution < 100ms
- [ ] SSL handshake < 200ms
- [ ] Page load < 2 seconds

---

**Next Action**: Update DNS records at registrar and configure Vercel/Fly.io domains  
**Estimated Time**: 1 hour total  
**Blocking**: Production access to all services
