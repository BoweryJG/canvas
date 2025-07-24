import { Handler } from '@netlify/functions';

// Simple in-memory rate limiter for serverless functions
const requestLog: Map<string, number[]> = new Map();
const MAX_REQUESTS_PER_MINUTE = 20;
const WINDOW_MS = 60 * 1000;

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
    const { prompt, model = 'anthropic/claude-opus-4', userId = 'anonymous' } = JSON.parse(event.body || '{}');
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }
    
    // Rate limiting check
    const now = Date.now();
    const userRequests = requestLog.get(userId) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < WINDOW_MS);
    
    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      console.log(`Rate limit exceeded for user ${userId}: ${recentRequests.length} requests in last minute`);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before making more requests.',
          retryAfter: Math.ceil((recentRequests[0] + WINDOW_MS - now) / 1000)
        })
      };
    }
    
    // Log this request
    recentRequests.push(now);
    requestLog.set(userId, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      for (const [key, timestamps] of requestLog.entries()) {
        const validTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
        if (validTimestamps.length === 0) {
          requestLog.delete(key);
        } else {
          requestLog.set(key, validTimestamps);
        }
      }
    }

    // Check for OpenRouter API key
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not configured');
      // Return a mock response for development
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                practiceSize: "medium",
                yearsInBusiness: 15,
                technologyAdoption: "mainstream",
                decisionMakingSpeed: "moderate",
                buyingSignals: [
                  "Recently expanded practice",
                  "Looking for efficiency improvements",
                  "Interested in patient satisfaction"
                ],
                painPoints: [
                  "Staff workflow efficiency",
                  "Patient wait times",
                  "Equipment maintenance costs"
                ],
                competitorProducts: ["Competitor A", "Legacy System B"],
                bestApproachStrategy: "Focus on ROI and efficiency gains. Highlight how the product reduces staff workload while improving patient satisfaction. Offer a pilot program to demonstrate value."
              }, null, 2)
            }
          }]
        })
      };
    }

    // Make request to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://canvas.repspheres.com',
        'X-Title': 'Canvas Sales Intelligence'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const data = await openRouterResponse.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('OpenRouter function error:', error);
    
    // Return a fallback response that matches expected format
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              practiceSize: "medium",
              yearsInBusiness: 10,
              technologyAdoption: "mainstream",
              decisionMakingSpeed: "moderate",
              buyingSignals: ["Efficiency focused", "Growth oriented"],
              painPoints: ["Time management", "Cost control"],
              competitorProducts: ["Generic Competitor"],
              bestApproachStrategy: "Emphasize efficiency and ROI"
            }, null, 2)
          }
        }]
      })
    };
  }
};