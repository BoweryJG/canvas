/**
 * Test script for API integrations
 * This tests the Brave Search, Firecrawl, and Perplexity APIs
 */

// Test Brave Search
async function testBraveSearch() {
  console.log('🔍 Testing Brave Search API...');
  
  try {
    const response = await fetch('/.netlify/functions/brave-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: 'Dr. John Smith orthopedic surgeon Los Angeles',
        count: 5 
      })
    });
    
    const data = await response.json();
    console.log('✅ Brave Search successful:', data.web?.results?.length || 0, 'results');
    return true;
  } catch (error) {
    console.error('❌ Brave Search failed:', error);
    return false;
  }
}

// Test Firecrawl
async function testFirecrawl() {
  console.log('🕷️ Testing Firecrawl API...');
  
  try {
    const response = await fetch('/.netlify/functions/firecrawl-scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: 'https://www.healthgrades.com',
        formats: ['markdown'],
        onlyMainContent: true
      })
    });
    
    const data = await response.json();
    console.log('✅ Firecrawl successful:', data.success ? 'Content scraped' : 'Failed');
    return data.success;
  } catch (error) {
    console.error('❌ Firecrawl failed:', error);
    return false;
  }
}

// Test Perplexity
async function testPerplexity() {
  console.log('🧠 Testing Perplexity API...');
  
  try {
    const response = await fetch('/.netlify/functions/perplexity-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: 'Dr. John Smith orthopedic surgeon practice information',
        mode: 'search'
      })
    });
    
    const data = await response.json();
    console.log('✅ Perplexity successful:', data.choices?.[0]?.message ? 'Response received' : 'No response');
    return !!data.choices?.[0]?.message;
  } catch (error) {
    console.error('❌ Perplexity failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API integration tests...\n');
  
  const results = await Promise.all([
    testBraveSearch(),
    testFirecrawl(),
    testPerplexity()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} APIs working`);
  
  if (passed === total) {
    console.log('🎉 All API integrations successful! Canvas research system ready.');
  } else {
    console.log('⚠️ Some APIs failed. Check logs above for details.');
  }
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.testAPIs = runTests;
} else {
  runTests();
}