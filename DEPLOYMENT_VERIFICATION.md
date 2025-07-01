# Canvas Deployment Verification Checklist

## 🚀 Netlify Deployment Status

### 1. Build Status
- [ ] Check Netlify Dashboard → Site deploys
- [ ] Latest deploy shows "Published"
- [ ] Build log shows no errors
- [ ] All environment variables loaded (check build log for warnings)

### 2. Live Site Testing

#### A. Basic Access
- [ ] Site loads at your Netlify URL
- [ ] No console errors in browser DevTools
- [ ] Navbar displays correctly with Canvas subtitle

#### B. Authentication
- [ ] Sign Up works (creates new account)
- [ ] Login works (can sign in)
- [ ] Logout works
- [ ] Password reset email sends

#### C. Core Features
- [ ] **NPI Search**: Search for "Gregory White" in NY
- [ ] **Website Discovery**: Should find practice websites
- [ ] **AI Content**: Generate outreach content
- [ ] **Scraper Service**: Check if screenshots load

### 3. Common Issues & Solutions

#### ❌ Build Failed
```
Error: Missing environment variable: VITE_SUPABASE_URL
```
**Solution**: Add missing variable in Netlify → Site configuration → Environment variables

#### ❌ 404 on API Calls
```
POST /.netlify/functions/npi-lookup 404
```
**Solution**: Check that functions folder is deployed. Redeploy if needed.

#### ❌ Scraper Service Error
```
Failed to fetch screenshot
```
**Solution**: 
- Verify VITE_SCRAPER_SERVICE_URL is set correctly
- Ensure scraper service is publicly accessible
- Not using localhost or 192.168.x.x

#### ❌ Authentication Error
```
Invalid API key
```
**Solution**: 
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Make sure they match your Supabase project

### 4. Quick Debug Commands

Open browser console and run:
```javascript
// Check if env vars loaded
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Test API endpoint
fetch('/.netlify/functions/npi-lookup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ firstName: 'Gregory', lastName: 'White', state: 'NY' })
}).then(r => r.json()).then(console.log);
```

### 5. Performance Check
- [ ] Page loads in < 3 seconds
- [ ] Search results appear in < 2 seconds
- [ ] No visible layout shifts

### 6. Mobile Testing
- [ ] Site is responsive on mobile
- [ ] Touch interactions work
- [ ] Modals display correctly

## 🎉 Success Indicators
- ✅ All builds passing
- ✅ No console errors
- ✅ Core features working
- ✅ API calls succeeding
- ✅ Scraper service connected

## 📞 If Issues Persist
1. Check Netlify build logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check browser console for errors
5. Ensure database migrations were run

---

**Your Canvas deployment is ready when all items above are checked! 🚀**