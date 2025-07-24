import { Handler } from '@netlify/functions';

const PERPLEXITY_API_KEY = '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';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      query, 
      mode = 'search', // 'search', 'reason', 'deep_research'
      model = 'sonar-small-128k-online'
    } = JSON.parse(event.body || '{}');

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    console.log(`🧠 Perplexity ${mode}: "${query.substring(0, 100)}..."`);

    // Select appropriate model based on mode
    let selectedModel = model;
    console.log(`📋 Using model: ${model}`);
    if (mode === 'reason') {
      selectedModel = 'sonar-large-128k-online';
    } else if (mode === 'deep_research') {
      selectedModel = 'sonar-large-128k-online'; // huge model might not exist anymore
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(mode)
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: mode === 'deep_research' ? 4000 : 2000,
        temperature: mode === 'reason' ? 0.2 : 0.1,
        top_p: 0.9,
        return_citations: true,
        search_domain_filter: ["healthgrades.com", "vitals.com", "webmd.com", "doximity.com"],
        return_images: false,
        return_related_questions: mode === 'deep_research',
        search_recency_filter: "month"
      })
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Perplexity error details:', errorText);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Perplexity API error: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    
    console.log(`✅ Perplexity ${mode} completed successfully`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Perplexity function error:', error);
    
    // More detailed error response
    const errorDetails = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    };
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorDetails)
    };
  }
};

function getSystemPrompt(mode: string): string {
  switch (mode) {
    case 'search':
      return `You are a medical intelligence researcher. Provide concise, factual information about doctors, medical practices, and healthcare professionals. Focus on publicly available information including practice details, credentials, locations, and professional background. Always cite your sources.`;
      
    case 'reason':
      return `You are an expert medical sales intelligence analyst. Analyze the provided information about doctors and medical practices to generate strategic insights for medical device/pharmaceutical sales. Consider practice patterns, technology adoption, market positioning, and sales opportunities. Provide actionable recommendations based on the data.`;
      
    case 'deep_research':
      return `You are conducting comprehensive research for medical sales intelligence. Provide an in-depth analysis covering: 1) Professional background and credentials, 2) Practice characteristics and patient demographics, 3) Technology adoption and innovation patterns, 4) Market position and competitive landscape, 5) Growth indicators and business intelligence, 6) Strategic sales recommendations. Use multiple sources and provide detailed citations.`;
      
    default:
      return `You are a helpful medical research assistant. Provide accurate, well-sourced information about healthcare professionals and medical practices.`;
  }
}