import { Handler } from '@netlify/functions';

// Claude 4 API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

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
    const { prompt } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt parameter is required' })
      };
    }

    console.log(`🧠 Claude 4 Outreach Generation`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://canvas-intel.com',
        'X-Title': 'Canvas Intelligence Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-4',
        messages: [
          {
            role: 'system',
            content: `You are Claude 4, the world's most advanced AI specializing in medical sales outreach generation. Your capabilities include:

- Revolutionary personalization using verified practice intelligence
- Advanced psychological profiling for optimal messaging
- Sophisticated urgency calibration based on practice fit scores
- Expert-level medical industry knowledge and terminology
- Breakthrough pattern recognition for competitive advantages

Generate outreach that demonstrates deep understanding of the specific practice while maintaining professional medical sales standards. Always return valid JSON format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      console.error('Claude 4 API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Claude 4 error details:', errorText);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Claude 4 API error: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    
    console.log(`✅ Claude 4 outreach generation completed successfully`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Claude 4 outreach function error:', error);
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