# ClearGlassInc Artemis

ClearGlassInc Artemis is an enterprise cybersecurity and intelligence engineering platform founded by **Desmond Otieno Odhiambo**. This repository contains a premium corporate website layer, governance documentation, and a production-grade architecture blueprint for secure, AI-enabled operations.

## Primary Assets
- Website pages (`index.html`, `about.html`, `services.html`, `contact.html`, `trust.html`)
- Legal pages (`privacy.html`, `terms.html`)
- Corporate documentation package (`docs/*.md`)
- Palantir full-stack implementation blueprint (`docs/ARTEMIS_PLATFORM_ARCHITECTURE.md`)
- Self-evolving intelligence platform design (`docs/clearglassinc_artemis_self_evolving_platform.md`)
- Self-evolving AI implementation blueprint (deep technical, Python-first) (`docs/CLEARGLASSINC_ARTEMIS_SELF_EVOLVING_AI_PLATFORM_BLUEPRINT.md`)
- Full-stack Gotham/Foundry/AIP/Apollo implementation blueprint (`docs/CLEARGLASSINC_ARTEMIS_FULLSTACK_BLUEPRINT.md`)
- Agentic bot implementation blueprint (`docs/ARTEMIS_AGENTIC_BOT_BLUEPRINT.md`)
- Autonomous revenue website and content bot blueprint (`docs/AUTONOMOUS_REVENUE_WEBSITE_AND_CONTENT_BOT.md`)
- COO operations system prompt (`docs/COO_BOT_PROMPT.md`)
- GitHub-native autonomous content generator (`automation/revenue_content_bot.py` + `config/revenue_bot_config.json`)

## Suggested Repository Description
`Enterprise cybersecurity intelligence engineering by ClearGlassInc Artemis: secure-by-design architecture, governance-first documentation, and AI-assisted mission operations.`


## GitHub Pages Deployment (Recommended)
This repository is a **plain HTML/CSS/JS static site** (`index.html` is already at repo root), so the fastest reliable deployment path is **GitHub Actions + Pages artifact deploy**.

### 1) Required repository settings
1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source = GitHub Actions**.
3. If using a custom domain, keep `CNAME` in repo root (`clearglassinc.io`) and configure your DNS:
   - `A` records for apex domain to GitHub Pages IPs.
   - `CNAME` for `www` to `<username>.github.io`.

### 2) Workflow used in this repo
- File: `.github/workflows/deploy-pages.yml`
- Trigger: pushes to `main` + manual run.
- Behavior: copies repository site files into `_site/`, validates `index.html`, adds `.nojekyll`, uploads artifact, then deploys to Pages.

- Troubleshooting runbook: `docs/GITHUB_PAGES_TROUBLESHOOTING.md`
- Netlify migration/cutover guide: `docs/PAGES_CUTOVER_FROM_NETLIFY.md`
- Quick fix playbook: `docs/PAGES_QUICK_FIX_PLAYBOOK.md`
- Risk ownership governance: `docs/RISK_OWNERSHIP_GOVERNANCE.md`

### 3) Verification checklist
- Confirm Actions workflow run succeeded.
- Open: `https://<username>.github.io/<repo>/` (or custom domain).
- If blank/404:
  - Ensure Pages source is **GitHub Actions**.
  - Ensure `index.html` exists in deployed artifact.
  - Check asset paths are relative (e.g., `./styles.css` not `/styles.css`) for project-site URLs.

### 4) Framework-specific note
If this project later migrates to React/Vite/Next.js/Astro/Svelte, replace static copy step with framework build output (`dist`, `out`, etc.) and set framework base path/static export options accordingly.
