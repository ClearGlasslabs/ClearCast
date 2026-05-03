# Cutover Guide: Netlify -> GitHub Pages

Use this when PRs show Netlify checks failing while migrating to GitHub Pages.

## Why this happens
Netlify app/check integrations still post statuses (for example `deploy-preview`, redirect/header checks) even if GitHub Pages workflow exists.

## Required actions
1. **GitHub Settings -> Pages**
   - Source: **GitHub Actions**.
2. **Netlify cleanup**
   - In Netlify site settings, disconnect the GitHub repository integration **or** disable Deploy Previews.
   - Remove Netlify app from the repository if no longer used (GitHub repo Settings -> Integrations / Installed GitHub Apps).
3. **Branch protection cleanup**
   - In GitHub repo Settings -> Branches -> Branch protection rule for `main`, remove required checks:
     - `netlify/.../deploy-preview`
     - `Header rules - ...`
     - `Redirect rules - ...`
   - Keep required checks for GitHub Actions workflow jobs instead (for example `GitHub Pages / verify`).
4. Optional: remove `netlify.toml` if fully decommissioning Netlify.

## Verification
- Open a PR and confirm `GitHub Pages / verify` runs and passes.
- Merge to `main` and confirm `GitHub Pages / deploy` succeeds.
- Confirm the live URL serves the latest commit.
