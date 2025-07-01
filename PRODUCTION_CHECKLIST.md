# Canvas Production Deployment Checklist

## 🚨 Critical Tasks Before Deployment

### 1. Environment Variables (Required in Netlify)
```env
# Supabase (Required)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Keys (Required)
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_PERPLEXITY_API_KEY=your-perplexity-key
VITE_BRAVE_SEARCH_API_KEY=your-brave-key
VITE_FIRECRAWL_API_KEY=your-firecrawl-key

# Communication (Required for outreach)
VITE_SENDGRID_API_KEY=your-sendgrid-key
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-token
VITE_TWILIO_PHONE_NUMBER=your-twilio-phone

# Stripe (Required for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-key

# Scraper Service (Required)
VITE_SCRAPER_SERVICE_URL=https://your-scraper-server.com:3001
```

### 2. Security Fixes Completed ✅
- [x] Removed hardcoded OpenRouter API key from deepResearch.js
- [x] All API keys now use environment variables
- [x] No hardcoded URLs or secrets in codebase

### 3. Database Setup
```sql
-- Run all migrations in order:
-- /supabase/migrations/001_initial_setup.sql through 010_create_user_settings.sql
```

### 4. Scraper Service Deployment
The scraper service needs to be deployed on a public server:
- Current: Running on local Dell (192.168.0.94)
- Production: Deploy to cloud service (AWS EC2, DigitalOcean, etc.)
- Update VITE_SCRAPER_SERVICE_URL in Netlify

### 5. Pre-Deployment Tasks
- [ ] Run `npm run build` locally to test build
- [ ] Fix any remaining TypeScript errors
- [ ] Test all critical user flows
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure custom domain in Netlify

### 6. Netlify Deployment Steps
1. **Connect Repository**
   - Go to Netlify Dashboard
   - "New site from Git"
   - Connect to GitHub repo

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all variables from section 1 above

4. **Deploy**
   - Trigger deploy from Netlify dashboard
   - Monitor build logs for errors

### 7. Post-Deployment Verification
- [ ] Test user registration/login
- [ ] Test NPI doctor search
- [ ] Test website discovery
- [ ] Test AI content generation
- [ ] Test email/SMS sending
- [ ] Test payment processing

### 8. Performance Optimizations
- [ ] Enable Netlify asset optimization
- [ ] Set up CDN caching rules
- [ ] Configure rate limiting for API endpoints
- [ ] Set up database connection pooling

### 9. Monitoring Setup
- [ ] Google Analytics (already configured)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Web Vitals)

## 🚀 Launch Checklist
- [ ] All environment variables set in Netlify
- [ ] Scraper service deployed and accessible
- [ ] Database migrations completed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error monitoring active
- [ ] First test user created successfully

## 📞 Support Setup
- [ ] Create support email address
- [ ] Set up help documentation
- [ ] Configure contact forms
- [ ] Prepare launch announcement

---

**Ready for Production:** Once all items above are checked ✅