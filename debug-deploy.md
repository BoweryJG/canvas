# Deployment Debugging Guide for CANVAS

## Issue: 404 Error and Black Screen After Deployment

### Root Cause
The application uses React Router for client-side routing, but Netlify wasn't configured to handle SPA (Single Page Application) routing properly. When accessing any route directly (like `/login`) or refreshing the page, Netlify was looking for physical files that don't exist, resulting in 404 errors.

### Solutions Implemented

1. **Created `_redirects` file** in the `public` directory:
   ```
   /* /index.html 200
   ```
   This ensures all routes are served by `index.html`, allowing React Router to handle client-side routing.

2. **Updated `netlify.toml`** with SPA redirect rule:
   ```toml
   # SPA redirect - handle client-side routing
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Next Steps

1. **Rebuild and Deploy**:
   ```bash
   npm run build
   # Then deploy to Netlify
   ```

2. **Verify Environment Variables** on Netlify:
   - Go to Site Settings > Environment Variables
   - Ensure all required variables are set:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - Any other API keys your app requires

3. **Check Browser Console** after deployment:
   - Open Developer Tools (F12)
   - Look for any 404 errors or JavaScript errors
   - Check Network tab for failed requests

4. **Common Issues to Check**:
   - Missing environment variables
   - API endpoint configuration
   - CORS issues with external APIs
   - Asset loading paths

### Additional Debugging

If issues persist after deployment:

1. **Check Build Logs** on Netlify:
   - Look for any build warnings or errors
   - Verify all dependencies are installed

2. **Test Locally with Production Build**:
   ```bash
   npm run build
   npm run preview
   ```
   This will serve the production build locally to verify it works before deployment.

3. **Clear Netlify Cache**:
   - In Netlify dashboard, go to Deploys
   - Click "Trigger deploy" > "Clear cache and deploy site"

### File Structure Verification
The build output should include:
- `dist/index.html`
- `dist/assets/` (with JS and CSS files)
- `dist/_redirects` (copied from public)
- `dist/_headers` (copied from public)

The `_redirects` file is crucial for SPA routing to work properly on Netlify.