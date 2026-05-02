# GitHub Pages Troubleshooting Runbook (2026)

Use this runbook when the site is not going live correctly.

## 0) Fast triage inputs to collect
- Repository URL
- Pages URL that fails
- Framework type (plain HTML, Vite, Next.js, Astro, etc.)
- Deployment method (branch/docs, `gh-pages`, Actions)
- Exact symptom: 404, blank page, assets 404, stale content, failed workflow
- Screenshot of **Settings → Pages** and failed **Actions** job logs

## 1) Quickest fixes first
1. Ensure repository has `index.html` in deployed artifact root.
2. Ensure **Settings → Pages → Source = GitHub Actions**.
3. Ensure successful run of `.github/workflows/deploy-pages.yml`.
4. Hard refresh + private window to rule out cache.
5. Wait 1-3 minutes for CDN propagation.

## 2) Symptom-to-cause map
### A) 404 on root URL
- Wrong Pages source (branch mode vs Actions mode mismatch).
- Missing `index.html` in output folder.
- Wrong repo URL (project page vs user page).

### B) Blank white page
- JavaScript runtime error from wrong base path.
- Script loaded from `/assets/...` instead of `./assets/...` on project pages.

### C) CSS/JS/images 404
- Absolute asset paths in HTML.
- Case mismatch (`Logo.png` vs `logo.png`).
- Build output folder mismatch (`dist` vs `out`).

### D) README shown instead of site
- Branch/folder deploy misconfigured (serving markdown folder, not site folder).

### E) Site not updating
- Workflow not triggered (wrong branch).
- Browser or CDN cache.

## 3) Framework-specific fixes

### Plain HTML/CSS/JS (current repo)
- Keep paths relative: `./styles.css`, `./main.js`, `./images/logo.png`.
- Keep `index.html` at deploy root.
- Keep `.nojekyll` in output to avoid Jekyll processing edge cases.

### Vite
```ts
// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  base: '/your-repo-name/' // use '/' only with custom apex domain
})
```

### Next.js (static export)
```js
// next.config.js
const isProjectPage = process.env.GH_PAGES === 'true'
module.exports = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProjectPage ? '/your-repo-name' : '',
  assetPrefix: isProjectPage ? '/your-repo-name/' : undefined,
}
```

### Astro
```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
export default defineConfig({
  site: 'https://<username>.github.io',
  base: '/your-repo-name/'
})
```

## 4) Force a fresh deployment
- Re-run the latest deployment workflow from Actions UI.
- Make a no-op commit:
```bash
git commit --allow-empty -m "chore: force pages rebuild"
git push
```
- Purge local browser cache and test in private window.

## 5) Production checklist
- `index.html` lowercase and present.
- Links/assets use correct relative/base path strategy.
- Custom domain DNS and `CNAME` are consistent.
- No failed Actions jobs on latest commit.
- Site URL and canonical domain both return 200.
