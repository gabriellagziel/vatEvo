# Vatevo — Online Status (Production Demo)
**Last Updated (Europe/Rome):** _fill on run_
**Commit:** `_fill_`
**Build Time (UTC):** `_fill_`
## API
- URL: `https://api.vatevo.com/status`
- Expected: `200 OK` + JSON `{"status":"ok", ...}`
- Evidence (last run):
```json
{ "service":"vatevo-api","env":"production","version":"0.1.0","commit_sha":"_fill_","build_time":"_fill_","uptime_seconds":42,"status":"ok" }
```

## Frontends

* Marketing: `https://vatevo.com` → 200
* Dashboard: `https://dashboard.vatevo.com` → 200
* Docs: `https://docs.vatevo.com` → 200

## DNS (target)

* @ → A 76.76.21.21
* www/dashboard/docs → CNAME cname.vercel-dns.com
* api → CNAME <DO default_ingress>
