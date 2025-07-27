// API Response Types and Type Guards

// Brave Search Types
export interface BraveSearchResult {
  title?: string;
  description?: string;
  url?: string;
  age?: string;
  snippet?: string;
  thumbnail?: string;
  favicon?: string;
}

export interface BraveSearchResponse {
  web?: {
    results: BraveSearchResult[];
  };
  query?: {
    original: string;
  };
}

// Claude/Anthropic Types
export interface ClaudeResponse {
  choices: Array<{
    message: {
      content: string;
      role?: string;
    };
  }>;
}

// Firecrawl Types
export interface FirecrawlResponse {
  data?: {
    markdown?: string;
    content?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
    };
  };
  error?: string;
  success?: boolean;
}

export interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    content?: string;
    html?: string;
    title?: string;
    metaDescription?: string;
    phones?: string[];
    emails?: string[];
    addresses?: string[];
  };
  error?: string;
  markdown?: string; // Add for direct access compatibility
}

// Perplexity Types
export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
      role?: string;
    };
  }>;
  citations?: string[];
  related_questions?: string[];
}

// Generic API Types
export interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
  success: boolean;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

// Type Guards
export function isBraveSearchResponse(response: any): response is BraveSearchResponse {
  return response && 
    (response.web?.results !== undefined || response.query?.original !== undefined);
}

export function isClaudeResponse(response: any): response is ClaudeResponse {
  return response && 
    Array.isArray(response.choices) &&
    response.choices.length > 0 &&
    response.choices[0].message?.content !== undefined;
}

export function isFirecrawlResponse(response: any): response is FirecrawlResponse {
  return response && 
    (response.data !== undefined || response.error !== undefined);
}

// Helper function to safely extract content
export function extractClaudeContent(response: ClaudeResponse): string {
  return response.choices[0]?.message?.content || '';
}

export function extractFirecrawlContent(response: FirecrawlResponse): string {
  return response.data?.markdown || response.data?.content || '';
}

export function extractBraveSearchResults(response: BraveSearchResponse): BraveSearchResult[] {
  return response.web?.results || [];
}