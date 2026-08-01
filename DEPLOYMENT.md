# ClearCast Deployment Guide

## Overview

ClearGlassInc Artemis (ClearCast) is deployed via GitHub Pages to `https://clearglassinc.io`.

## Architecture

- **Primary deployment**: GitHub Pages (automated, via `deploy-pages.yml`)
- **Custom domain**: CNAME: `clearglassinc.io`
- **Branch**: `main` (auto-deploys on push)
- **DNS**: Custom domain configured in repository Pages settings

## Workflows

### `deploy-pages.yml` (ACTIVE)
- **Trigger**: Push to main, manual dispatch
- **Steps**:
  1. Validate static site files (`index.html`, `styles.css`, `script.js`)
  2. Stage artifact (copy root to `_site/`)
  3. Upload to GitHub Pages
  4. Deploy to `clearglassinc.io`

### `jekyll-docker.yml` (CI-ONLY)
- Builds Jekyll site for validation
- Does not deploy; used for CI checks only

### `site-integrity.yml` (VALIDATION)
- Validates required files exist
- Checks for broken links
- Runs on push/PR/dispatch

### `server-test.yml` (DISABLED)
- **Status**: Disabled (self-hosted runner not available)
- **Purpose**: Would deploy via SSH to custom VPS
- **To enable**: Register self-hosted runner with tags `[self-hosted, linux, clearglass]`

## Setup & Enablement

### GitHub Pages Configuration (One-time)
1. Go to **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Set **Custom domain** to `clearglassinc.io`
4. Verify DNS (`CNAME` record already in repo)

### Manual Deployment
- Go to **Actions** → **GitHub Pages Deploy** → **Run workflow** → select branch

### Secrets & Configuration
- **GitHub Pages**: No secrets required (built-in GITHUB_TOKEN)
- **SSH deployment** (future): Requires `SERVER_HOST`, `SERVER_USER`, `PRIVATE_KEY`

## Monitoring & Troubleshooting

### Deployment Status
- Check **Actions** tab for latest run
- Verify artifact uploads in "Deploy Pages" job
- Check site accessibility at `https://clearglassinc.io`

### Common Issues

| Issue | Solution |
|-------|----------|
| Pages site returns 404 | Ensure "GitHub Pages" is enabled in Settings → Pages |
| Custom domain not working | Verify CNAME DNS record points to `clearglassinc.io` |
| Workflow fails at "Configure Pages" | GitHub Pages must be enabled and GitHub Actions source selected |
| Missing static files | Validate `index.html`, `styles.css`, `script.js` exist in root |

## Self-Hosted Runner Setup (Optional)

To enable SSH deployment via `server-test.yml`:

1. **Register runner**: `./run.sh --url https://github.com/ClearGlasslabs/ClearCast --token <TOKEN>`
2. **Add labels**: `self-hosted`, `linux`, `clearglass`
3. **Configure secrets**:
   - `SERVER_HOST`: VPS hostname/IP
   - `SERVER_USER`: SSH username
   - `PRIVATE_KEY`: Private SSH key (PEM format)
4. **Update** `server-test.yml` and set `if: github.event_name != 'pull_request'` (remove `false` guards)

## Release Checklist

Before deploying to production:

- [ ] All integrity checks pass (`site-integrity.yml`)
- [ ] Static files are present and valid
- [ ] No broken links detected
- [ ] GitHub Pages is enabled and configured
- [ ] Custom domain resolves correctly
- [ ] Artifact is staged correctly in `_site/`
- [ ] Deployment job completes successfully

## Rollback

GitHub Pages deployments are instant. To rollback:

1. Identify last known good commit
2. Push to `main` (or manually trigger workflow on previous commit)
3. Pages redeploy within seconds
