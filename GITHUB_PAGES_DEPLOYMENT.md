# GitHub Pages Deployment Guide

## Overview

This project is configured for automated deployment to GitHub Pages on every push to `main` branch.

## Prerequisites

1. Repository must be **public** (required for GitHub Pages)
2. GitHub Pages must be enabled in repository settings
3. Deployment source: GitHub Actions (configured in `CI_WORKFLOW.yml`)

## Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under "Build and deployment":
   - Source: `GitHub Actions`
   - Save

### Step 2: Verify Workflow File

The CI workflow is already configured to:
- Build on every push to `main`/`develop`
- Run linter and tests
- Deploy to Pages on `main` push

File location: `.github/workflows/ci.yml`

### Step 3: Add GitHub Pages Domain (Optional)

If using custom domain:
1. Settings → Pages → Custom domain
2. Add `yourdomain.com`
3. Update DNS records (CNAME or A records)
4. Wait for verification (~24h)

## Deployment Flow

```
git push main
    ↓
GitHub Actions triggered
    ↓
npm ci && npm run build
    ↓
Build outputs → dist/
    ↓
Upload artifact to Pages
    ↓
Deploy to https://username.github.io/solar-system
    ↓
Live! 🚀
```

## Build Output

- **Build time:** ~30-60 seconds
- **Output size:** ~15-25MB (including textures)
- **Deploy time:** ~1-2 minutes total

## Accessing Your Site

**After first deployment:**
- Default: `https://username.github.io/solar-system`
- Custom domain: `https://yourdomain.com` (if configured)

Check deployment status:
1. Repository → **Actions** tab
2. Click latest workflow run
3. View "Deploy to GitHub Pages" step

## Troubleshooting

### Deployment fails with "Build failed"

Check workflow logs:
1. Actions → Latest run → lint-test-build job
2. Look for errors in "Run linter" or "Build production" steps
3. Common issues:
   - ESLint errors: `npm run lint -- --fix`
   - Test failures: `npm run test -- --run`
   - Missing textures: ensure textures in `assets/`

### Site shows 404 or blank page

Check:
1. **Base path** in `vite.config.js`: `base: './'` ✓
2. **Repository name** in GitHub - if not "solar-system", update base
3. **Workflow permissions** in Settings → Actions → General: "Read and write permissions" ✓

### Changes not appearing

1. Wait 2-5 minutes after push (deployment takes time)
2. Refresh with **Ctrl+Shift+R** (hard refresh to clear cache)
3. Check GitHub Pages is enabled (Settings → Pages)
4. View page source to confirm it's the updated build

## Environment Variables

GitHub Pages URLs are dynamic. Update config if needed:

**vite.config.js:**
```javascript
base: process.env.NODE_ENV === 'production' 
  ? '/solar-system/' 
  : '/',
```

**index.html:**
```html
<base href="/solar-system/">
```

## Optimization Tips

### Reduce Build Size

1. **Texture optimization** (see TEXTURE_OPTIMIZATION.md):
   ```bash
   npm run convert-textures  # WebP/AVIF → 40-60% smaller
   ```

2. **Bundle splitting** (already configured in vite.config.js):
   - `three` vendor chunk
   - `gui` vendor chunk
   - `utils` chunk
   - Enables better caching

3. **Disable sourcemaps** (already disabled in production):
   ```javascript
   build: { sourcemap: false }
   ```

### Monitor Deployment

Add to `.gitignore` (already done):
```
dist/
node_modules/
*.log
```

## Advanced: Custom Domain with Cloudflare

1. Add CNAME to DNS: `solar-system.yourdomain.com → username.github.io`
2. Go to repository Settings → Pages
3. Enter custom domain: `solar-system.yourdomain.com`
4. Enforce HTTPS (auto-provision with Let's Encrypt)

## CI/CD Pipeline Stages

| Stage | Command | Purpose |
|-------|---------|---------|
| **Lint** | `npm run lint` | Code quality check |
| **Test** | `npm run test` | Unit/integration tests |
| **Build** | `npm run build` | Production build |
| **Deploy** | `upload + deploy` | Push to GitHub Pages |

All stages must pass for deployment.

## Rollback / Revert

If deployment has issues, revert last commit:
```bash
git revert HEAD
git push main
```

New deployment will automatically trigger with the previous version.

## See Also

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
