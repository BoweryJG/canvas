#!/usr/bin/env node

const https = require('https');

console.log('\n🔍 Canvas Authentication Debug Script\n');

// Supabase configuration
const SUPABASE_URL = 'https://cbopynuvhcymbumjnvay.supabase.co';
const SUPABASE_PROJECT_REF = 'cbopynuvhcymbumjnvay';

// Check current redirect URLs configured in Supabase
async function checkSupabaseRedirectUrls() {
  console.log('📋 Current Supabase Redirect URLs Configuration:');
  console.log('   (These need to be configured in your Supabase Dashboard)\n');
  
  console.log('Required URLs for local development:');
  console.log('   - http://localhost:5173/*');
  console.log('   - http://localhost:5173/');
  console.log('   - http://localhost:5173/auth/callback');
  console.log('   - http://localhost:3000/*');
  console.log('   - http://localhost:3000/');
  console.log('   - http://localhost:3000/auth/callback');
  console.log('   - http://localhost:7002/*');
  console.log('   - http://localhost:7002/');
  console.log('   - http://localhost:7002/auth/callback\n');
  
  console.log('Required URLs for production:');
  console.log('   - https://canvas.repspheres.com/*');
  console.log('   - https://canvas.repspheres.com/');
  console.log('   - https://canvas.repspheres.com/auth/callback\n');
  
  console.log('⚠️  IMPORTANT: The wildcard URLs (with /*) are CRITICAL!');
  console.log('   Supabase sometimes redirects to the root URL with the token in the hash.\n');
}

// Check local auth configuration
function checkLocalAuthConfig() {
  console.log('🔧 Local Auth Configuration Issues to Check:\n');
  
  console.log('1. Supabase Client Configuration:');
  console.log('   - flowType should be set to "implicit" for better OAuth handling');
  console.log('   - detectSessionInUrl should be true');
  console.log('   - persistSession should be true');
  console.log('   - Storage key must match: sb-' + SUPABASE_PROJECT_REF + '-auth-token\n');
  
  console.log('2. OAuth Redirect Flow:');
  console.log('   - The app should detect #access_token in URL on initial load');
  console.log('   - AuthContext should wait for Supabase to process tokens');
  console.log('   - App.tsx should redirect to /auth/callback when tokens detected\n');
  
  console.log('3. Common Issues:');
  console.log('   - Port mismatch (e.g., dev server on 5173 but redirect URL for 3000)');
  console.log('   - Missing wildcard redirect URLs in Supabase');
  console.log('   - Browser blocking third-party cookies');
  console.log('   - Service worker caching old auth state\n');
}

// Generate test URLs
function generateTestUrls() {
  console.log('🌐 Test URLs for Different Scenarios:\n');
  
  const ports = ['5173', '3000', '7002'];
  
  ports.forEach(port => {
    console.log(`For localhost:${port}:`);
    console.log(`   Direct: http://localhost:${port}/login`);
    console.log(`   Callback: http://localhost:${port}/auth/callback`);
    console.log(`   Root: http://localhost:${port}/\n`);
  });
}

// Provide fix instructions
function provideFix() {
  console.log('✅ Steps to Fix Authentication:\n');
  
  console.log('1. Go to Supabase Dashboard:');
  console.log('   https://app.supabase.com/project/' + SUPABASE_PROJECT_REF + '/auth/url-configuration\n');
  
  console.log('2. Add ALL the redirect URLs listed above');
  console.log('   - Don\'t forget the wildcard URLs (/*) - they are crucial!\n');
  
  console.log('3. Clear browser data:');
  console.log('   - Clear localStorage for your app domain');
  console.log('   - Clear cookies for supabase.co domain');
  console.log('   - Disable any browser extensions that might interfere\n');
  
  console.log('4. Test authentication:');
  console.log('   - Start your dev server (npm run dev)');
  console.log('   - Note the port number (usually 5173)');
  console.log('   - Go to http://localhost:[PORT]/login');
  console.log('   - Try signing in with Google/GitHub\n');
  
  console.log('5. If still not working:');
  console.log('   - Check browser console for errors');
  console.log('   - Check Network tab for redirect URLs');
  console.log('   - Verify the redirect URL matches your current port');
  console.log('   - Try incognito/private mode\n');
}

// Main execution
async function main() {
  await checkSupabaseRedirectUrls();
  checkLocalAuthConfig();
  generateTestUrls();
  provideFix();
  
  console.log('📝 Additional Notes:');
  console.log('   - The auth flow uses implicit grant type');
  console.log('   - Tokens are passed in URL hash (#access_token=...)');
  console.log('   - Canvas handles the callback at /auth/callback route');
  console.log('   - Session is stored in localStorage\n');
}

main().catch(console.error);