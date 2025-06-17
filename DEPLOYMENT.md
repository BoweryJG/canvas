# Canvas - Deployment Guide

## Prerequisites
- Netlify account
- Supabase project
- Stripe account
- API keys from .env.example

## Deployment Steps

### 1. Environment Variables in Netlify
Set these in Netlify Dashboard > Site Settings > Environment Variables:

#### Required Variables
```
REACT_APP_SUPABASE_URL=your_production_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
BRAVE_API_KEY=your-brave-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

#### Stripe Price IDs (Production)
```
STRIPE_PRICE_CLOSER_MONTHLY=price_closer_monthly_id
STRIPE_PRICE_CLOSER_ANNUAL=price_closer_annual_id
STRIPE_PRICE_DOMINATOR_MONTHLY=price_dominator_monthly_id
STRIPE_PRICE_DOMINATOR_ANNUAL=price_dominator_annual_id
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly_id
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_enterprise_annual_id
```

### 2. Deploy Command
Already configured in netlify.toml:
```
npm run build
```

### 3. Stripe Webhook Setup
1. In Stripe Dashboard, create a webhook endpoint:
   - URL: https://canvas.repspheres.com/api/stripe/webhook
   - Events: checkout.session.completed, customer.subscription.*

2. Copy the webhook secret and add to Netlify env vars

### 4. Domain Setup
Configure in Netlify:
- Primary domain: canvas.repspheres.com
- SSL automatically provisioned

### 5. Authentication
- Uses same Supabase project as other RepSpheres apps
- Users need to sign in separately (no cross-domain SSO)
- Same email/password works across all apps

### 6. Post-Deployment Checklist
- [ ] Test login flow
- [ ] Verify Stripe subscription checkout
- [ ] Test AI research features
- [ ] Check that all API integrations work
- [ ] Verify Netlify Functions are deployed

## Quick Deploy
1. Connect GitHub repo to Netlify
2. Set all environment variables
3. Deploy
4. Configure Stripe webhooks
5. Test payment flow