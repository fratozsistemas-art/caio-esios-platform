# 🚀 Deployment Guide - CAIO Platform

## ⚠️ Current Status: Build Blocked

The application **cannot be deployed** currently due to a pre-existing build issue.

---

## 🐛 Build Issue

### Error
```
Could not load /src/functions/autoMarkTestWinner (imported by src/pages/ABTestingDashboard.jsx)
ENOENT: no such file or directory, open '/src/functions/autoMarkTestWinner'
```

### Root Cause
- **@base44/vite-plugin** v0.2.5 has a path resolution bug
- File exists at `functions/autoMarkTestWinner.ts`
- Plugin looks in incorrect path `/src/functions/autoMarkTestWinner`
- Import uses `@/functions/autoMarkTestWinner`

### Impact
- ❌ `npm run build` fails
- ❌ Cannot create `dist/` directory
- ❌ Cannot deploy to Cloudflare Pages
- ❌ Cannot deploy to any production environment

### Not Caused By
✅ This issue existed **before** our optimization work  
✅ **Not caused** by Phase 1 or Phase 2 changes  
✅ Verified on `main` branch before our changes  

---

## 🔧 Workaround (Temporary)

To deploy despite the build issue, follow these steps:

### Step 1: Comment Out Problematic Import

Edit `src/pages/ABTestingDashboard.jsx`:

```javascript
// Line 23 - Comment out:
// import { autoMarkTestWinner } from '@/functions/autoMarkTestWinner';

// Line 103 - Comment out:
// mutationFn: () => autoMarkTestWinner({}),
```

### Step 2: Build the Project

```bash
cd /home/user/webapp
npm run build
```

✅ Build should succeed and create `dist/` directory

### Step 3: Deploy to Cloudflare Pages

```bash
# Option A: Using Wrangler CLI
npx wrangler pages deploy dist --project-name=caio-platform

# Option B: Using Wrangler with custom config
npx wrangler pages deploy dist \
  --project-name=caio-platform \
  --branch=main \
  --commit-message="Deploy from manual build"
```

### Step 4: Revert Changes

```bash
# Undo the commented lines
git checkout src/pages/ABTestingDashboard.jsx

# Or manually uncomment the lines
```

---

## ✅ Permanent Fix (Required)

### Option A: Upgrade Base44 Plugin

If a newer version is available:

```bash
npm install @base44/vite-plugin@latest
npm install @base44/sdk@latest
```

Then test:
```bash
npm run build
```

### Option B: Fix Import Path

Change import in `src/pages/ABTestingDashboard.jsx`:

```javascript
// OLD (broken):
import { autoMarkTestWinner } from '@/functions/autoMarkTestWinner';

// NEW (might work):
import { autoMarkTestWinner } from '../../functions/autoMarkTestWinner';
```

### Option C: Update Vite Config

Add path alias to `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
    }),
    react()
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@/functions': '/functions'  // Add this
    }
  }
});
```

### Option D: Contact Base44 Support

Report the issue to Base44:
- Plugin version: v0.2.5
- SDK version: v0.8.3
- Issue: Path resolution for `@/functions/*` imports fails during build

---

## 📋 Cloudflare Pages Configuration

### Required Files

**`wrangler.toml`** (or `wrangler.jsonc`):

```toml
name = "caio-platform"
compatibility_date = "2024-12-27"
pages_build_output_dir = "dist"

[site]
bucket = "./dist"
```

### Environment Variables

Set in Cloudflare Dashboard or via Wrangler:

```bash
# Base44 API
wrangler pages secret put BASE44_APP_ID
wrangler pages secret put BASE44_SERVER_URL
wrangler pages secret put BASE44_TOKEN

# Other required secrets
wrangler pages secret put OPENAI_API_KEY
wrangler pages secret put STRIPE_SECRET_KEY
```

### Build Command

In Cloudflare Pages settings:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`
- **Node version:** `20.x`

---

## 🧪 Testing Build Locally

### Test Build (Without Deploying)

```bash
cd /home/user/webapp
npm run build
```

✅ **Success:** `dist/` directory created  
❌ **Failure:** See error above

### Test Preview

```bash
npm run preview
```

Opens preview server at http://localhost:4173

### Test Cloudflare Locally

```bash
npx wrangler pages dev dist
```

Opens local Cloudflare Pages environment

---

## 🎯 Deployment Checklist

Before deploying:

- [ ] Build passes: `npm run build` succeeds
- [ ] Tests pass: `npm run test` (if applicable)
- [ ] Lint passes: `npm run lint` (or fix warnings)
- [ ] Environment variables configured in Cloudflare
- [ ] Cloudflare project created
- [ ] Domain configured (if custom domain)
- [ ] Preview deployment tested
- [ ] Rollback plan prepared

---

## 🚨 Emergency Rollback

If deployment causes issues:

### Option 1: Revert in Cloudflare Dashboard
1. Go to Cloudflare Pages dashboard
2. Select project
3. Go to "Deployments"
4. Find previous working deployment
5. Click "..." → "Rollback to this deployment"

### Option 2: Revert in Git
```bash
git revert <commit-hash>
git push origin main
```

Cloudflare will auto-deploy the revert.

### Option 3: Redeploy Previous Version
```bash
git checkout <previous-commit>
npm run build
npx wrangler pages deploy dist
```

---

## 📊 Deployment Metrics

Track these after deployment:

- **Build time:** Target < 2 minutes
- **Deployment time:** Target < 1 minute
- **Bundle size:** Current ~5-10 MB (after optimizations)
- **Time to Interactive (TTI):** Target < 3 seconds
- **First Contentful Paint (FCP):** Target < 1.5 seconds

---

## 🔗 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Base44 Documentation](https://docs.base44.com/)

---

## 💡 Tips

### Speed Up Build

```bash
# Use build cache
npm run build -- --mode production

# Skip type checking (faster, risky)
npm run build -- --skipTypeCheck
```

### Debug Build Issues

```bash
# Verbose build output
npm run build -- --debug

# Check bundle analysis
npm run build -- --analyze
```

### Optimize Bundle

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js and build
npm run build
```

---

## ✅ When Build Works

After the Base44 plugin issue is fixed:

```bash
# Simple deployment flow:
npm run build
npx wrangler pages deploy dist --project-name=caio-platform

# Or with CI/CD:
git push origin main
# Cloudflare auto-deploys
```

---

**Status:** ⚠️ **Blocked** by build issue  
**Workaround:** Available (see above)  
**Permanent Fix:** Required (contact Base44 or update plugin)  
**Last Updated:** 2025-12-27
