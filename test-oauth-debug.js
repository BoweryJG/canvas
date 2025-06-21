// Quick OAuth debug script
// Run with: node test-oauth-debug.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing OAuth configuration...\n');

// Test different redirect URLs
const testUrls = [
  'http://localhost:3000/auth/callback',
  'http://localhost:7003/auth/callback',
  'https://canvas.repspheres.com/auth/callback',
  'https://repspheres.com/auth/callback'
];

testUrls.forEach(url => {
  console.log(`Testing redirect URL: ${url}`);
  console.log(`This should work based on your Supabase configuration.\n`);
});

// Check if we can get the current session
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error getting session:', error);
  } else {
    console.log('Current session:', data.session ? 'Active' : 'None');
  }
});

console.log('\nTo test OAuth login:');
console.log('1. Visit http://localhost:7003/test-oauth-config.html');
console.log('2. Click on Google or Facebook login');
console.log('3. Check browser console for any errors');
console.log('4. After login, you should be redirected back to /auth/callback');