#!/usr/bin/env node

/**
 * Test script to verify deployment issues
 * Run this after deployment to check for common problems
 */

async function testDeployment(siteUrl) {
  console.log('🔍 Testing deployment at:', siteUrl);
  console.log('==================================\n');

  const tests = [
    {
      name: 'Homepage loads',
      url: siteUrl,
      check: (response, text) => response.ok && text.includes('CANVAS')
    },
    {
      name: 'Client-side routing works',
      url: `${siteUrl}/login`,
      check: (response, text) => response.ok && text.includes('<div id="root">')
    },
    {
      name: 'Static assets accessible',
      url: `${siteUrl}/vite.svg`,
      check: (response) => response.ok
    },
    {
      name: 'Service worker loads',
      url: `${siteUrl}/service-worker.js`,
      check: (response) => response.ok
    },
    {
      name: '_redirects file present',
      url: `${siteUrl}/_redirects`,
      check: (response) => response.status === 404 || response.ok // Netlify processes this file
    }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      const text = await response.text();
      const passed = test.check(response, text);
      
      console.log(`${passed ? '✅' : '❌'} ${test.name}`);
      if (!passed) {
        console.log(`   Status: ${response.status}`);
        console.log(`   URL: ${test.url}`);
        if (response.status === 404) {
          console.log(`   Error: Resource not found`);
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n📋 Checklist for manual verification:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Network tab');
  console.log('3. Visit the site and check for:');
  console.log('   - Any 404 errors in Console');
  console.log('   - Failed asset loads in Network tab');
  console.log('   - JavaScript errors in Console');
  console.log('4. Try navigating to different routes');
  console.log('5. Try refreshing on a non-home route');
}

// Get site URL from command line
const siteUrl = process.argv[2];
if (!siteUrl) {
  console.error('Usage: node test-deployment.js <site-url>');
  console.error('Example: node test-deployment.js https://your-site.netlify.app');
  process.exit(1);
}

testDeployment(siteUrl);