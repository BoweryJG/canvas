/**
 * Common API Response Types
 * These types help handle external API responses with TypeScript
 */

// Generic API response handler - allows known properties plus any additional ones
export type ApiResponse<T> = T & {
  [key: string]: any;
}

// Brave Search API Types
export interface BraveSearchResult {
  url: string;
  title: string;
  description: string;
  age?: string;
  page_age?: string;
  snippet?: string;
}

export interface BraveSearchResponse {
  web?: {
    results?: BraveSearchResult[];
  };
  [key: string]: any;
}

// Claude/Anthropic API Types
export interface ClaudeResponse {
  content?: string;
  choices?: Array<{ 
    message: { 
      content: string 
    } 
  }>;
  [key: string]: any;
}

// Helper type for functions that can return either format
export type ClaudeResponseOrString = ClaudeResponse | string;

// Firecrawl API Types
export interface FirecrawlResponse {
  success?: boolean;
  data?: {
    content?: string;
    markdown?: string;
    [key: string]: any;
  };
  error?: string;
  [key: string]: any;
}

// Perplexity API Types
export interface PerplexityResponse {
  content?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  [key: string]: any;
}

// Common Research Result Type
export interface ResearchResult {
  name?: string;
  location?: any;
  practice?: any;
  specialty?: any;
  rating?: any;
  reviews?: any;
  contact?: any;
  experience?: any;
  [key: string]: any;
}

// Sales Report Analysis Type
export interface SalesAnalysis {
  opportunityScore?: number;
  messagingStrategy?: any;
  salesStrategy?: any;
  buyingSignals?: any;
  closingStrategy?: any;
  nextSteps?: any;
  actionItems?: any;
  painPoints?: any;
  decisionMakers?: any;
  budgetIndicators?: any;
  [key: string]: any;
}

// Helper function to safely extract string content from various response types
export function extractStringContent(response: ClaudeResponseOrString | PerplexityResponse | any): string {
  if (typeof response === 'string') {
    return response;
  }
  
  // Check for direct content property
  if (response?.content) {
    return response.content;
  }
  
  // Check for OpenAI/Claude format with choices
  if (response?.choices?.[0]?.message?.content) {
    return response.choices[0].message.content;
  }
  
  // Fallback to empty string
  return '';
}

// Type guard functions
export function isBraveSearchResult(obj: any): obj is BraveSearchResult {
  return obj && typeof obj.url === 'string' && typeof obj.title === 'string';
}

export function isClaudeResponse(obj: any): obj is ClaudeResponse {
  return obj && (typeof obj.content === 'string' || Array.isArray(obj.choices));
}

// Generic type for any API response with unknown structure
export type AnyApiResponse = Record<string, any>;