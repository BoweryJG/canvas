import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    console.log('Testing OpenRouter chat completions API...');
    console.log('API Key length:', apiKey.length);
    console.log('API Key prefix:', apiKey.substring(0, 15));

    // First test models endpoint (this works)
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://canvas-intel-module.netlify.app',
      }
    });

    console.log('Models API Status:', modelsResponse.status);

    // Now test chat completions
    const testResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://canvas-intel-module.netlify.app',
        'X-Title': 'Canvas Intelligence Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      })
    });

    console.log('API Response Status:', testResponse.status);
    console.log('API Response Headers:', Object.fromEntries(testResponse.headers));

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.log('API Error Response:', errorText);
      
      return {
        statusCode: testResponse.status,
        headers,
        body: JSON.stringify({
          error: 'OpenRouter API failed',
          status: testResponse.status,
          details: errorText
        })
      };
    }

    const result = await testResponse.json();
    console.log('API Success Response:', JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        result: result,
        modelsApiStatus: modelsResponse.status,
        keyInfo: {
          present: !!apiKey,
          length: apiKey.length,
          prefix: apiKey.substring(0, 15)
        }
      })
    };

  } catch (error) {
    console.error('Debug function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};