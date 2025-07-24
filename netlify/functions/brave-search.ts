import { Handler } from '@netlify/functions';

// Type definitions
interface BraveSearchRequest {
  query?: string;
  count?: number;
}

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  published?: string;
}

interface BraveSearchAPIResponse {
  web?: {
    results?: BraveSearchResult[];
  };
}

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAe5JOYNgM9vHXnme_VZ1BQKBVkuv-';

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
    const { query, count = 10 }: BraveSearchRequest = JSON.parse(event.body || '{}');

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    console.log(`🔍 Brave Search: "${query}"`);

    // Construct URL with search parameters
    const searchUrl = new URL('https://api.search.brave.com/res/v1/web/search');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('count', count.toString());
    searchUrl.searchParams.append('country', 'US');
    searchUrl.searchParams.append('safesearch', 'moderate');

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      }
    });

    if (!response.ok) {
      console.error('Brave API error:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Brave Search API error: ${response.status}` 
        })
      };
    }

    const data: BraveSearchAPIResponse = await response.json();
    
    console.log(`✅ Brave Search returned ${data.web?.results?.length || 0} results`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Brave Search function error:', error);
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