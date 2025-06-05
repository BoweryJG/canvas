// Debug helper to test OpenRouter function
export async function debugOpenRouter() {
  console.log('🔍 Testing OpenRouter function...');
  
  try {
    // Test 1: Basic connectivity
    const testUrl = '/.netlify/functions/openrouter';
    console.log(`📡 Testing URL: ${window.location.origin}${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Test prompt',
        model: 'anthropic/claude-3-sonnet'
      })
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 404) {
      console.error('❌ Function not found! Possible issues:');
      console.error('1. Function not deployed yet');
      console.error('2. Function name mismatch');
      console.error('3. Netlify configuration issue');
    } else {
      const data = await response.json();
      console.log('✅ OpenRouter response:', data);
    }
    
    return response;
  } catch (error) {
    console.error('❌ OpenRouter test failed:', error);
    throw error;
  }
}

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).debugOpenRouter = debugOpenRouter;
}