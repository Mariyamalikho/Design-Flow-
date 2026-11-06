# DesignFlow Production Deployment Guide

This guide details the deployment architecture, configuration, and continuous deployment workflows for DesignFlow v1.0.

---

## 1. Overview

DesignFlow is a client-side, local-first Single Page Application (SPA) powered by Vite, React 19, TypeScript, and IndexedDB via Dexie.js. Because all persistent data is stored directly in client-side storage, DesignFlow requires zero backend servers to run in production and can be hosted on static hosting providers such as **GitHub Pages** or **Vercel**.

---

## 2. GitHub Pages Deployment

### 2.1 Workflow Pipeline Template
The automated deployment workflow is provided in [`deploy/deploy.yml`](../deploy/deploy.yml).

Key stages in the deployment pipeline:
1. **Checkout & Environment Setup**: Checks out repository with Node.js 22 LTS and clean dependency installation (`npm ci`).
2. **Quality Gates**: Runs static code hygiene analysis (`npm run lint`) and the full automated Vitest test suite (`npm test`).
3. **Production Build**: Compiles optimized production bundle via `npm run build` into `./dist`.
4. **Pages Artifact Upload & Deployment**: Uses official GitHub Pages actions (`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`) with OIDC authentication tokens.

### 2.2 SPA Deep-Linking Fallback on GitHub Pages
Because GitHub Pages serves static files without server rewrite engines, navigating directly to deep paths (e.g., `/projects`, `/tasks`, `/brand-kit`) could result in a 404 error if not handled.

DesignFlow resolves this with:
1. [`public/404.html`](../public/404.html): Intercepts 404 responses and redirects the client to the root path (`/`) with query parameters preserving the intended pathname and search parameters.
2. [`index.html`](../index.html): Restores the original deep link URL using `window.history.replaceState(...)` before the React Router initializes.

---

## 3. Vercel Deployment

### 3.1 Routing Fallback & Header Rules
DesignFlow includes [`vercel.json`](../vercel.json) pre-configured with:
- **SPA Rewrites**: Redirects all requests (`/(.*)`) to `/index.html` with status 200, ensuring clean browser history navigation.
- **Security Headers**:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Asset Caching**:
  - `Cache-Control: public, max-age=31536000, immutable` for static hashed assets (`/assets/*`).
  - `Cache-Control: public, max-age=0, must-revalidate` for `index.html` to guarantee instant delivery of new versions.

### 3.2 Vercel CLI / Git Integration
To deploy to Vercel:
```bash
# Using Vercel CLI
npm install -g vercel
vercel deploy --prod

# Or connect repository directly via Vercel Dashboard:
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install
```

---

## 4. Verification Checklist
- [x] Production build passes without TypeScript errors (`npm run build`).
- [x] Full automated test suite passes (`npm test`).
- [x] SPA client routing deep links reload without 404 errors.
- [x] Offline database schema (Dexie v1.0.0) initializes smoothly.
