# OAuth Authentication Debug Guide for Canvas

## Current OAuth Configuration Analysis

### 1. **Application Configuration**
- **Dev Port**: 7002 (from vite.config.ts)
- **Supabase Project**: cbopynuvhcymbumjnvay
- **Auth Callback Route**: `/auth/callback`
- **Redirect URL**: `http://localhost:7002/auth/callback` (development)

### 2. **Identified Issues and Solutions**

#### Issue 1: Redirect URL Mismatch
The OAuth configuration uses dynamic redirect URLs based on `window.location.origin`. This can cause issues if:
- The Supabase dashboard has different redirect URLs configured
- The port differs between development and what's configured in Supabase

**Solution**:
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Ensure these redirect URLs are whitelisted:
   - `http://localhost:7002/auth/callback`
   - `https://canvas.repspheres.com/auth/callback`
   - Any other domains you're using

#### Issue 2: Cross-Domain Authentication Complexity
The app has cross-domain auth setup which might interfere with OAuth:
- Multiple storage keys are being used
- Complex domain checking logic

**Solution**:
1. For OAuth testing, use the local domain configuration in AuthContext.tsx (line 158):
   ```typescript
   const redirectUrl = `${window.location.origin}/auth/callback`;
   ```

#### Issue 3: Session Detection Issues
The AuthCallback component uses a simple timeout instead of properly detecting the OAuth callback:
```typescript
setTimeout(() => {
  if (user) {
    navigate('/');
  } else if (!loading) {
    navigate('/login');
  }
}, 1000);
```

**Solution**: Update AuthCallback.tsx to properly handle OAuth callbacks:
```typescript
useEffect(() => {
  const handleCallback = async () => {
    try {
      // Get the session from the URL
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        // Session established, redirect to home
        navigate('/');
      } else {
        // Check if we have OAuth params in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        if (hashParams.get('access_token') || urlParams.get('code')) {
          // OAuth tokens present, wait for auth to process
          console.log('OAuth tokens detected, processing...');
        } else {
          // No tokens, redirect to login
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      navigate('/login');
    }
  };
  
  handleCallback();
}, [navigate]);
```

### 3. **Debugging Steps**

1. **Open the debug tool**:
   ```bash
   # Start your dev server
   npm run dev
   
   # Open in browser
   http://localhost:7002/debug-oauth-issues.html
   ```

2. **Check Browser Console** for:
   - CORS errors
   - Network errors on OAuth redirect
   - JavaScript errors in auth handling

3. **Verify Supabase Configuration**:
   - Go to https://supabase.com/dashboard/project/cbopynuvhcymbumjnvay/auth/providers
   - Check Google OAuth settings
   - Verify redirect URLs match your app

4. **Test OAuth Flow**:
   - Clear all auth storage (use the button in debug tool)
   - Click OAuth provider button
   - Watch for redirect URL in browser
   - Check if you return to `/auth/callback`
   - Monitor console for errors

### 4. **Common OAuth Errors and Fixes**

#### Error: "redirect_uri_mismatch"
**Fix**: Add your redirect URL to OAuth provider settings in Supabase

#### Error: "Invalid refresh token"
**Fix**: Clear local storage and try again:
```javascript
localStorage.removeItem('repspheres-auth');
localStorage.removeItem('sb-cbopynuvhcymbumjnvay-auth-token');
```

#### Error: "No access_token in URL"
**Fix**: Check if detectSessionInUrl is enabled in supabase config

#### Error: OAuth popup blocked
**Fix**: Ensure signInWithOAuth is called from user interaction (click handler)

### 5. **Quick Fix Checklist**

- [ ] Verify app is running on port 7002
- [ ] Check Supabase redirect URLs include `http://localhost:7002/auth/callback`
- [ ] Clear browser cache and cookies
- [ ] Disable browser extensions (especially ad blockers)
- [ ] Check browser console for specific errors
- [ ] Verify OAuth providers are enabled in Supabase
- [ ] Test in incognito/private browsing mode

### 6. **Testing OAuth Providers**

Use the test page at `http://localhost:7002/test-oauth-config.html` to:
1. Test each OAuth provider individually
2. See exact redirect URLs being used
3. Monitor auth state changes
4. Check for JavaScript errors

### 7. **Production Considerations**

For production deployment:
1. Update redirect URLs to include production domain
2. Ensure HTTPS is used for all OAuth redirects
3. Set proper cookie configuration for cross-domain auth
4. Test OAuth flow on staging environment first

## Next Steps

1. Run the debug tool and check for specific errors
2. Verify Supabase OAuth configuration matches your URLs
3. Test with the simplified OAuth test page
4. Check browser network tab during OAuth flow
5. Look for any CORS or redirect errors

If issues persist, check:
- Supabase project logs
- Browser network tab for failed requests
- OAuth provider settings (Google/Facebook console)