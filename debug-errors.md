# Canvas Header Error Debug Guide

## Issues Identified and Solutions

### 1. DNS Resolution Error (net::ERR_NAME_NOT_RESOLVED) ✅
**Problem**: The app is trying to resolve a domain that doesn't exist.
**Likely Cause**: This appears to be a secondary error from failed API calls or missing configuration.
**Solution**: The DNS error should resolve once the other issues are fixed.

### 2. Supabase 404 Errors ✅
**Problem**: The `canvas_research_cache` table doesn't exist in your Supabase database.
**Solution**: 
1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to the SQL Editor
3. Run the SQL script in `setup-supabase-tables.sql`
4. This will create all the necessary tables

### 3. Netlify Function Timeouts (499 errors) ✅
**Problem**: Functions are timing out before completing their operations.
**Solutions Applied**:
1. Added `timeout = 26` to netlify.toml (maximum allowed for free tier is 26 seconds)
2. The functions already have internal timeouts set

### 4. Missing Environment Variables
**Check**: Make sure these are set in your Netlify dashboard:
- `OPENROUTER_API_KEY`
- `BRAVE_API_KEY`
- `FIRECRAWL_API_KEY`
- `PERPLEXITY_API_KEY` (if using Perplexity)

Go to: Netlify Dashboard → Site Settings → Environment Variables

### 5. API Configuration
**Current Status**: Your `.env` file has the API keys, but they need to be in Netlify too.

## Next Steps

1. **Set up Supabase tables**:
   ```bash
   # Copy the SQL from setup-supabase-tables.sql
   # Run it in your Supabase SQL editor
   ```

2. **Add environment variables to Netlify**:
   - OPENROUTER_API_KEY=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
   - BRAVE_API_KEY=BSAa1HYHLYST-OnE4Y7kfh4_tgJ1ZUR
   - FIRECRAWL_API_KEY=fc-fef78fc8b3514610a1ef2bd048d7d13d

3. **Redeploy your site**:
   ```bash
   git add .
   git commit -m "Fix function timeouts and add debug info"
   git push origin main
   ```

4. **Monitor the deployment** and check if errors persist.

## Testing

After deployment, test the app with:
1. Search for "Dr. greg white buffalo" (fix the spelling to "buffalo")
2. Check browser console for any remaining errors
3. Verify that research results are being cached in Supabase

## Performance Tips

1. The Firecrawl scraping can be slow for some sites. Consider:
   - Implementing a loading state with progress indicators
   - Caching results more aggressively
   - Using parallel requests wisely

2. For production, consider upgrading Netlify to get:
   - Longer function timeouts (up to 5 minutes)
   - Better performance
   - More concurrent executions