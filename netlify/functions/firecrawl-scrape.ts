import { Handler } from '@netlify/functions';

const FIRECRAWL_API_KEY = 'fc-fef78fc8b3514610a1ef2bd048d7d13d';

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
    const { url, formats = ['markdown'], onlyMainContent = true, removeBase64Images = true } = JSON.parse(event.body || '{}');

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }

    console.log(`🕷️ Firecrawl scraping: ${url}`);

    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats,
        onlyMainContent,
        removeBase64Images,
        timeout: 30000 // 30 second timeout
      })
    });

    if (!response.ok) {
      console.error('Firecrawl API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Firecrawl error details:', errorText);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Firecrawl API error: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    
    console.log(`✅ Firecrawl successfully scraped ${url}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Firecrawl function error:', error);
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