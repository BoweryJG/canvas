/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Determine the API base URL based on environment
const hostname = window.location.hostname;
console.log('🌍 Current hostname:', hostname);

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (hostname === 'localhost' 
    ? 'http://localhost:3001' // Local development server
    : hostname === 'canvas.repspheres.com'
    ? 'https://osbackend-zl1h.onrender.com' // Production Render backend
    : '/.netlify/functions'); // Fallback for other deployments

console.log('🔧 Using API_BASE_URL:', API_BASE_URL);

// API endpoint paths
const isNetlify = API_BASE_URL === '/.netlify/functions';
export const API_ENDPOINTS = {
  braveSearch: isNetlify ? `${API_BASE_URL}/brave-search` : `${API_BASE_URL}/api/brave-search`,
  firecrawlScrape: isNetlify ? `${API_BASE_URL}/firecrawl-scrape` : `${API_BASE_URL}/api/firecrawl-scrape`,
  openRouter: isNetlify ? `${API_BASE_URL}/openrouter` : `${API_BASE_URL}/api/openrouter`,
  perplexityResearch: isNetlify ? `${API_BASE_URL}/perplexity-research` : `${API_BASE_URL}/api/perplexity-research`,
  npiLookup: isNetlify ? `${API_BASE_URL}/npi-lookup` : `${API_BASE_URL}/api/npi-lookup`,
  sendMagicLink: isNetlify ? `${API_BASE_URL}/send-magic-link` : `${API_BASE_URL}/api/send-magic-link`,
  apifyActor: isNetlify ? `${API_BASE_URL}/apify-actor` : `${API_BASE_URL}/api/apify-actor`,
};

// Helper to get the correct API endpoint
export function getApiEndpoint(endpoint: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[endpoint];
}