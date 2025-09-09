# Fly.io Domain & Certificate Setup Instructions

## Required Configuration

### Domain Setup
- **Domain**: api.vatevo.com
- **App**: app-ezgnqzzi
- **Target**: app-ezgnqzzi.fly.dev

## Steps to Configure Domain & Certificate

### 1. Add Custom Domain
```bash
# Add the custom domain to the app
fly certs add api.vatevo.com --app app-ezgnqzzi

# Verify the domain was added
fly certs show api.vatevo.com --app app-ezgnqzzi
```

### 2. Verify Certificate Status
```bash
# Check certificate status
fly certs list --app app-ezgnqzzi

# Expected output should show:
# api.vatevo.com    Ready    Let's Encrypt
```

### 3. DNS Configuration
After adding the domain, Fly.io will provide the CNAME record:

```
api.vatevo.com    CNAME    app-ezgnqzzi.fly.dev
```

### 4. Verify SSL Certificate
```bash
# Test SSL certificate
openssl s_client -connect api.vatevo.com:443 -servername api.vatevo.com

# Test HTTPS endpoint
curl -I https://api.vatevo.com/healthz
```

## Expected Results

### Certificate Information
- **Issuer**: Let's Encrypt
- **Status**: Ready
- **Type**: TLS 1.2/1.3
- **Auto-renewal**: Yes

### DNS Resolution
```bash
# Should resolve to Fly.io IP
dig +short A api.vatevo.com
# Expected: IP address (e.g., 66.241.124.xxx)

# CNAME should point to Fly.io
dig +short CNAME api.vatevo.com
# Expected: app-ezgnqzzi.fly.dev
```

### HTTPS Verification
```bash
# Should return 200 OK
curl -I https://api.vatevo.com/healthz
# Expected: HTTP/2 200

# Should show valid SSL certificate
curl -I https://api.vatevo.com/docs
# Expected: HTTP/2 200
```

## Current Status

- **App**: app-ezgnqzzi (running)
- **Domain**: Not yet configured
- **Certificate**: Not yet issued
- **DNS**: Not yet configured

## Troubleshooting

### If Certificate Fails
1. Check domain ownership
2. Verify DNS propagation
3. Wait 5-10 minutes for certificate issuance
4. Check Fly.io logs: `fly logs --app app-ezgnqzzi`

### If DNS Resolution Fails
1. Verify CNAME record is correct
2. Check DNS propagation: `dig @8.8.8.8 api.vatevo.com`
3. Wait for DNS propagation (up to 24 hours)

## Next Steps

1. Add domain: `fly certs add api.vatevo.com --app app-ezgnqzzi`
2. Verify certificate: `fly certs show api.vatevo.com --app app-ezgnqzzi`
3. Update DNS records at domain registrar
4. Test HTTPS endpoints
5. Verify SSL certificate validity
