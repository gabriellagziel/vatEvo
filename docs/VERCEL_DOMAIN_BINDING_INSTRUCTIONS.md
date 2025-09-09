# Vercel Domain Binding Instructions

## Required Domain Bindings

### 1. Marketing Site (vat-evo-marketing)
- **Domain**: vatevo.com (apex)
- **Domain**: www.vatevo.com
- **Project**: vat-evo-marketing
- **Project ID**: prj_MRCZDXWDTRRTyRRfHJ5ornncrIFv

### 2. Dashboard Site
- **Domain**: dashboard.vatevo.com
- **Project**: vat-evo-dashboard (needs to be created)
- **Configuration**: apps/dashboard/package.json

### 3. Docs Site
- **Domain**: docs.vatevo.com
- **Project**: vat-evo-docs (needs to be created)
- **Configuration**: apps/docs/package.json

## Steps to Bind Domains

### For Marketing Site (Existing Project)
1. Go to Vercel Dashboard
2. Navigate to project: vat-evo-marketing
3. Go to Settings → Domains
4. Add domains:
   - vatevo.com
   - www.vatevo.com
5. Verify DNS records shown in Vercel UI
6. Wait for SSL certificates to be issued (5-10 minutes)

### For Dashboard Site (New Project)
1. Create new Vercel project: vat-evo-dashboard
2. Connect to apps/dashboard directory
3. Deploy the project
4. Go to Settings → Domains
5. Add domain: dashboard.vatevo.com
6. Verify DNS records and SSL

### For Docs Site (New Project)
1. Create new Vercel project: vat-evo-docs
2. Connect to apps/docs directory
3. Deploy the project
4. Go to Settings → Domains
5. Add domain: docs.vatevo.com
6. Verify DNS records and SSL

## Expected DNS Records

After binding, Vercel will provide these DNS records:

```
# Apex domain
vatevo.com           A      76.76.21.21

# Subdomains
www.vatevo.com       CNAME  cname.vercel-dns.com
dashboard.vatevo.com CNAME  cname.vercel-dns.com
docs.vatevo.com      CNAME  cname.vercel-dns.com
```

## Verification Steps

1. Check DNS resolution:
   ```bash
   dig +short A vatevo.com
   dig +short CNAME www.vatevo.com
   dig +short CNAME dashboard.vatevo.com
   dig +short CNAME docs.vatevo.com
   ```

2. Test HTTPS:
   ```bash
   curl -I https://vatevo.com
   curl -I https://www.vatevo.com
   curl -I https://dashboard.vatevo.com
   curl -I https://docs.vatevo.com
   ```

3. Verify SSL certificates are valid
4. Check that all domains return 200 OK

## Current Status

- **Marketing**: Project exists, needs domain binding
- **Dashboard**: Project needs to be created
- **Docs**: Project needs to be created
- **DNS**: Not yet configured (still pointing to Squarespace)
