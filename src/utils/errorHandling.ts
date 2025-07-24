/**
 * Error handling utilities for production-ready Canvas app
 */

// Custom error classes
export class APIError extends Error {
  statusCode?: number;
  endpoint?: string;
  
  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  field?: string;
  
  constructor(
    message: string,
    field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Error messages for user display
export const UserFriendlyErrors = {
  NETWORK: 'Unable to connect. Please check your internet connection.',
  SERVER: 'Our servers are experiencing issues. Please try again later.',
  NOT_FOUND: 'The requested information could not be found.',
  UNAUTHORIZED: 'You need to be logged in to access this feature.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  VALIDATION: 'Please check your input and try again.',
  GENERIC: 'Something went wrong. Please try again.',
  NPI_LOOKUP: 'Unable to search doctors. Please try again.',
  PERPLEXITY: 'Intelligence generation temporarily unavailable.',
  PDF_GENERATION: 'Unable to generate report. Please try again.'
};

// Get user-friendly error message
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 404:
        return UserFriendlyErrors.NOT_FOUND;
      case 401:
        return UserFriendlyErrors.UNAUTHORIZED;
      case 429:
        return UserFriendlyErrors.RATE_LIMIT;
      case 500:
      case 502:
      case 503:
        return UserFriendlyErrors.SERVER;
      default:
        return UserFriendlyErrors.GENERIC;
    }
  }
  
  if (error instanceof NetworkError) {
    return UserFriendlyErrors.NETWORK;
  }
  
  if (error instanceof ValidationError) {
    return error.message || UserFriendlyErrors.VALIDATION;
  }
  
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.toLowerCase().includes('network')) {
      return UserFriendlyErrors.NETWORK;
    }
    if (error.message.toLowerCase().includes('fetch')) {
      return UserFriendlyErrors.NETWORK;
    }
  }
  
  return UserFriendlyErrors.GENERIC;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error, attempt) => {
    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (error instanceof APIError) {
      const code = error.statusCode || 0;
      return code === 429 || code >= 500;
    }
    // Retry on network errors
    if (error instanceof NetworkError) {
      return attempt < 3;
    }
    return false;
  }
};

// Retry wrapper for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const options = { ...defaultRetryConfig, ...config };
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === options.maxAttempts || !options.shouldRetry(error, attempt)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        options.initialDelay * Math.pow(options.backoffFactor, attempt - 1),
        options.maxDelay
      );
      
      console.log(`Retry attempt ${attempt} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Error logging for production
export function logError(error: unknown, context?: Record<string, unknown>) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  // In production, send to error tracking service
  if (window.location.hostname !== 'localhost') {
    // TODO: Send to Sentry or similar
    console.error('Production error:', errorInfo);
  } else {
    console.error('Development error:', errorInfo);
  }
}

// API response wrapper
export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response isn't JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new APIError(errorMessage, response.status, response.url);
  }
  
  try {
    return await response.json();
  } catch {
    throw new Error('Invalid response format');
  }
}

// Input validation helpers
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}