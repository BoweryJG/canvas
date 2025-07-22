/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Determine the API base URL based on environment
const hostname = window.location.hostname;
console.log('🌍 Current hostname:', hostname);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (hostname === 'localhost' 
    ? '' // Use proxy in development to avoid CORS
    : hostname === 'canvas.repspheres.com'
    ? 'https://osbackend-zl1h.onrender.com' // Production Render backend
    : 'https://osbackend-zl1h.onrender.com'); // ALWAYS use Render backend

console.log('🔧 Using API_BASE_URL:', API_BASE_URL);

// API endpoint paths
export const API_ENDPOINTS = {
  braveSearch: `${API_BASE_URL}/api/brave-search`,
  firecrawlScrape: `${API_BASE_URL}/api/firecrawl-scrape`,
  anthropic: `${API_BASE_URL}/api/anthropic`,
  perplexityResearch: `${API_BASE_URL}/api/perplexity-research`,
  // NPI lookup should use Netlify function directly to avoid CORS issues
  npiLookup: '/.netlify/functions/npi-lookup',
  sendMagicLink: `${API_BASE_URL}/api/send-magic-link`,
  apifyActor: `${API_BASE_URL}/api/apify-actor`,
};

// Helper to get the correct API endpoint
export function getApiEndpoint(endpoint: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[endpoint];
}