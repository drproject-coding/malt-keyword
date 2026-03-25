# Vercel Deployment Guide

## Prerequisites

1. Vercel account (free or paid)
2. GitHub repository (can link or import project)
3. Node.js 18+ installed locally

## Deployment Methods

### Option 1: GitHub Integration (Recommended)

1. Push this project to GitHub (if not already)
2. Go to https://vercel.com/dashboard
3. Click "Add New..." → "Project"
4. Select your GitHub repository
5. Vercel auto-detects Next.js project
6. Click "Deploy"
7. Wait for build and deployment to complete
8. Get your public URL from project dashboard

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production (main branch)
vercel --prod
```

## Configuration

- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Framework:** Next.js 14+ (auto-detected)
- **Environment Variables:** None required for Phase 1

## After Deployment

### Verify Live Deployment

1. Visit your Vercel project URL (e.g., https://malt-keyword.vercel.app)
2. Type a keyword and verify results appear
3. Open DevTools Network tab
4. Check response time: should be < 1 second
5. Search same keyword again → should hit cache (look for Age header or X-Vercel-Cache header)

### Check Cache Headers

```bash
# Replace with your actual Vercel URL
curl -I "https://malt-keyword.vercel.app/api/malt/autocomplete?q=python"

# Should see: Cache-Control: max-age=0, s-maxage=60, stale-while-revalidate=300
```

### Performance Monitoring

1. Vercel dashboard shows:
   - Build times
   - Deployment status
   - Real-time analytics
   - Function invocations

2. Monitor edge cache hit rate in Analytics tab

## Troubleshooting

### Build Fails

Check Vercel logs for errors. Common issues:

- Missing environment variables (check `.env.example`)
- Dependency issues (try `npm ci` locally)
- TypeScript errors (run `npm run build` locally first)

### Slow Response Times

1. Check Vercel Analytics for performance data
2. Verify cache headers are being set (API proxy should set them)
3. Check if API calls are timing out (Malt API dependency)

### Domain Configuration

To use a custom domain:

1. Go to Vercel project Settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records per Vercel instructions

## Rollback

If you need to revert to a previous deployment:

1. Go to Vercel project Deployments tab
2. Find previous successful deployment
3. Click menu → "Promote to Production"

## Next Steps

Once deployed:

- Run E2E tests against live URL
- Monitor analytics for traffic
- Plan Phase 2 (Email capture)
- Consider upgrade to Pro tier if traffic exceeds hobby limits
