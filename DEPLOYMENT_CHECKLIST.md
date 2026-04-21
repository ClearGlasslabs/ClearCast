# clearglassinc.io deployment checklist

This repo now includes basic static-host routing files to prevent `ERR_FAILED` from host/protocol drift:

- `CNAME` pins the site to `clearglassinc.io`.
- `_redirects` forces HTTPS, canonicalizes `www` to apex, and keeps SPA routes working.

## DNS records required

Create/update the following records at your DNS provider:

1. **Apex (`clearglassinc.io`)**
   - `A` records to your host's required IPs (or `ALIAS/ANAME` if supported).
2. **WWW (`www.clearglassinc.io`)**
   - `CNAME` to `clearglassinc.io`.

## Verification

```bash
# DNS should resolve
dig +short @1.1.1.1 clearglassinc.io A
dig +short @1.1.1.1 www.clearglassinc.io CNAME

# HTTP should redirect to HTTPS
curl -I http://clearglassinc.io
curl -I http://www.clearglassinc.io

# Canonical URL should be HTTPS apex
curl -I https://www.clearglassinc.io
curl -I https://clearglassinc.io
```


## One-command bash validation

```bash
./scripts/check_site.sh clearglassinc.io
```
