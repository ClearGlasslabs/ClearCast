# GitHub Pages 2026 Reference (Static Sites)

## Recommended workflow file
Use `.github/workflows/deploy-pages.yml` in this repository as the canonical workflow.

Key properties:
- `verify` job on PRs (fast checks, no production deploy)
- `deploy` job on `main` (artifact upload + `actions/deploy-pages@v4`)
- `permissions` minimized globally, elevated only for deploy job
- `concurrency` set to avoid overlapping publishes

## GitHub settings (exact)
1. Repository **Settings** -> **Pages**
2. **Build and deployment** -> **Source** = `GitHub Actions`
3. Save.

## Netlify deconfliction
1. Netlify -> Site settings -> Build & deploy:
   - Disable Deploy Previews (or disconnect GitHub integration).
2. GitHub -> Settings -> Branches -> Branch protection (`main`):
   - Remove Netlify checks from required checks.
   - Keep `GitHub Pages / verify` as required.
3. GitHub -> Settings -> Applications / Installed GitHub Apps:
   - Remove Netlify app from this repo if fully migrated.

## Force redeploy
```bash
git commit --allow-empty -m "chore: force pages rebuild"
git push
```
