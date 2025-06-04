# 🔐 RepSpheres Shared Authentication Implementation

## ✅ Complete! All 3 apps now share the same auth system

### What's Been Done:
1. **Canvas** - Full auth implementation built here first
2. **Market Insights** - Auth folder copied, .env configured
3. **CRM (Sphere oS)** - Auth folder copied, .env configured

### Auth Features Available:
- Google OAuth login
- Facebook OAuth login  
- Session persistence
- Role-based access (admin detection)
- Auth guards and redirects
- TypeScript fully typed

### Usage in Each App:

```tsx
// Import auth components
import { useAuth } from './auth';
import { AuthGuard } from './auth/guards';
import { LoginForm } from './auth/LoginForm';

// Use in components
const MyComponent = () => {
  const { user, signInWithProvider, signOut } = useAuth();
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Logout</button>
      ) : (
        <button onClick={() => signInWithProvider('google')}>
          Login with Google
        </button>
      )}
    </div>
  );
};

// Protect routes
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

### Deployment Steps:
1. Ensure .env files are NOT committed (already in .gitignore)
2. Set environment variables in your hosting platform:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Deploy each app

### Single Sign-On:
Users who login to any app will be logged into all apps automatically since they share the same Supabase project!

### Future Enhancement:
When ready, extract auth folder to `@repspheres/auth` NPM package for easier updates.