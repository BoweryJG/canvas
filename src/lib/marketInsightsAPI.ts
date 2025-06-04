/**
 * API wrapper functions for Market Insights
 * Maps the existing API endpoints to the expected function names
 */

import { callFirecrawlScrape, callPerplexityResearch } from './apiEndpoints';

export const callPerplexityAPI = async (params: { query: string; model?: string }) => {
  const mode = params.model === 'sonar-reasoning' ? 'reason' : 'search';
  const result = await callPerplexityResearch(params.query, mode);
  
  // Extract the content from the response
  if (result.choices?.[0]?.message?.content) {
    return result.choices[0].message.content;
  }
  return null;
};

export const callFirecrawlAPI = async (params: { url: string; formats?: string[] }) => {
  const result = await callFirecrawlScrape(params.url, {
    formats: params.formats || ['markdown']
  });
  
  return result;
};

// Re-export callBraveSearch as is
export { callBraveSearch } from './apiEndpoints';