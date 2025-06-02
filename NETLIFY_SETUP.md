# Netlify Environment Variables Setup

## Critical Issue: API Authentication Failing

The Canvas Intelligence Platform is currently failing with 401 authentication errors because the API keys are not properly configured in Netlify's environment variables.

## Required Environment Variables

You need to set these in your Netlify dashboard:

1. **OPENROUTER_API_KEY**: `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`
2. **BRAVE_API_KEY**: `BSAe5JOYNgM9vHXnme_VZ1BQKBVkuv-`
3. **FIRECRAWL_API_KEY**: `fc-fef78fc8b3514610a1ef2bd048d7d13d`

## How to Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com/
2. Select your site: `canvas-intel-module`
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. For each variable:
   - **Key**: Enter the variable name (e.g., `OPENROUTER_API_KEY`)
   - **Value**: Enter the API key value
   - **Scope**: Select **Functions** (this is critical!)
   - **Deploy context**: Select **All** or **Production**
6. Click **Create variable**
7. Repeat for all three API keys

## Alternative: Using Netlify CLI

If you have Netlify CLI installed:

```bash
netlify env:set OPENROUTER_API_KEY "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"
netlify env:set BRAVE_API_KEY "BSAe5JOYNgM9vHXnme_VZ1BQKBVkuv-"
netlify env:set FIRECRAWL_API_KEY "fc-fef78fc8b3514610a1ef2bd048d7d13d"
```

## After Setting Variables

1. **Redeploy your site** - Environment variable changes require a new deployment
2. Test the AI functionality
3. Check function logs for any remaining errors

## Current Status

- ✅ Functions are deployed correctly
- ✅ API keys work when tested directly
- ❌ Environment variables not configured in Netlify
- ❌ 401 authentication errors in production

## Test Endpoints

After setting the variables, you can test:
- https://canvas-intel-module.netlify.app/.netlify/functions/test-auth
- The main AI scanning functionality should work

## Important Notes

- The `.env` file in your repository is only for local development
- Netlify functions require variables to be set in the Netlify dashboard
- Make sure to set the scope to "Functions" when creating variables
- Variables may take a few minutes to propagate after creation