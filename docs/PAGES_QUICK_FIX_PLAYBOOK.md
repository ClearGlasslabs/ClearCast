# GitHub Pages Quick Fix Playbook

## Start here (clarifying inputs)
- Exact repository name (`owner/repo`)
- Framework/build tool (plain HTML, Vite, Next.js, Astro, etc.)
- Current `.github/workflows/deploy-pages.yml`
- Whether Netlify should be fully removed or kept for previews

## Fastest path to green checks + live Pages
1. Set **Settings -> Pages -> Source: GitHub Actions**.
2. Keep PR checks lightweight (`verify` only), deploy only on `main`.
3. Remove Netlify required checks from branch protection.
4. Disable/disconnect Netlify GitHub app if migrating fully.
5. Merge PR once `GitHub Pages / verify` is green.
6. Confirm `GitHub Pages / deploy` succeeds on `main`.

## Why "This branch has not been deployed" appears
That message is expected on feature branches because deploy is intentionally restricted to `main`.

## Force fresh deployment
```bash
git commit --allow-empty -m "chore: force pages redeploy"
git push
```
Then re-run latest deploy workflow from the Actions tab.
