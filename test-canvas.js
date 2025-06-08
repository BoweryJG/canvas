// Test Canvas Research System
async function testCanvas() {
  console.log('Testing Canvas Research System...');
  
  // Test OpenRouter directly
  try {
    const response = await fetch('http://localhost:3001/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Say hello and confirm you are Claude Opus 4',
        model: 'anthropic/claude-opus-4'
      })
    });
    
    const data = await response.json();
    console.log('OpenRouter Response:', data);
    
    if (data.error) {
      console.error('OpenRouter Error:', data.error);
    } else {
      console.log('Model used:', data.model || 'claude-opus-4');
    }
  } catch (error) {
    console.error('API Error:', error);
  }
  
  // Test Brave Search
  try {
    const searchResponse = await fetch('http://localhost:3001/api/brave-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'dentist Buffalo NY',
        count: 5
      })
    });
    
    const searchData = await searchResponse.json();
    console.log('Brave Search Response:', searchData);
  } catch (error) {
    console.error('Brave Search Error:', error);
  }
}

// Run the test
testCanvas();