import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    console.log('Environment check:');
    console.log('OPENROUTER_API_KEY present:', !!apiKey);
    console.log('OPENROUTER_API_KEY length:', apiKey?.length || 0);
    console.log('OPENROUTER_API_KEY prefix:', apiKey?.substring(0, 10) || 'none');
    console.log('Full key for debugging:', apiKey);
    
    // Test minimal API call
    const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://canvas-intel-module.netlify.app',
      }
    });
    
    console.log('API test response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.log('API test error:', errorText);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hasApiKey: !!apiKey,
        keyLength: apiKey?.length || 0,
        keyPrefix: apiKey?.substring(0, 10) || 'none',
        apiTestStatus: testResponse.status,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};