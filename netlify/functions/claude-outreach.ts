import { Handler } from '@netlify/functions';

// Claude AI API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY environment variable is not set!');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const { prompt } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt parameter is required' })
      };
    }

    // Parse the prompt parameter which contains the actual request data
    let requestData;
    try {
      requestData = JSON.parse(prompt);
    } catch (parseError) {
      // If prompt is not JSON, use it as a simple string
      requestData = { messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1500 };
    }

    const { messages, temperature = 0.3, max_tokens = 1500 } = requestData;

    console.log(`🧠 Claude AI API call with ${messages?.length || 0} messages`);
    console.log(`🔑 Using API key: ${OPENROUTER_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`🔑 API key length: ${OPENROUTER_API_KEY?.length || 0}`);
    console.log(`🔑 API key prefix: ${OPENROUTER_API_KEY?.substring(0, 10) || 'none'}`);
    console.log(`🔑 Full API key for debug: ${OPENROUTER_API_KEY}`);
    console.log(`🔑 Authorization header: Bearer ${OPENROUTER_API_KEY}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://canvas-intel-module.netlify.app',
        'X-Title': 'Canvas Intelligence Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4',
        messages: messages || [
          {
            role: 'system',
            content: `You are Claude, an advanced AI specializing in medical sales intelligence. Your capabilities include:

- Revolutionary personalization using verified practice intelligence
- Advanced psychological profiling for optimal messaging
- Sophisticated urgency calibration based on practice fit scores
- Expert-level medical industry knowledge and terminology
- Breakthrough pattern recognition for competitive advantages

Generate analysis that demonstrates deep understanding of the specific practice while maintaining professional medical sales standards.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens,
        temperature,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Claude error details:', errorText);
      console.error('Request was:', JSON.stringify({ model: 'anthropic/claude-3.5-sonnet', messages: messages?.slice(0,1) }));
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Claude API error: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    
    console.log(`✅ Claude API call completed successfully`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Claude API function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};