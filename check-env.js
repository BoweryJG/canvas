// Check required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY'
];

console.log('Checking environment variables...');
let hasErrors = false;

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

if (hasErrors) {
  console.error('\n⚠️  Please set all required environment variables in Netlify Dashboard');
  console.error('Go to: Site Settings → Environment Variables');
} else {
  console.log('\n✅ All required environment variables are set!');
}