/**
 * URL Debugger - Temporarily override URL constructor to log invalid URLs
 */

// Store the original URL constructor
const OriginalURL = window.URL;

// Override the URL constructor
window.URL = function(url: string | URL, base?: string | URL) {
  try {
    // Try to create the URL with the original constructor
    return new OriginalURL(url as string, base as string);
  } catch (error) {
    // Log the error with full details
    console.error('Failed to construct URL:', {
      url,
      base,
      error: error instanceof Error ? error.message : String(error),
      stack: new Error().stack
    });
    
    // Re-throw the original error
    throw error;
  }
} as any;

// Copy static methods
Object.setPrototypeOf(window.URL, OriginalURL);
Object.setPrototypeOf(window.URL.prototype, OriginalURL.prototype);

// Copy static properties
for (const key of Object.getOwnPropertyNames(OriginalURL)) {
  if (key !== 'prototype' && key !== 'length' && key !== 'name') {
    try {
      (window.URL as any)[key] = (OriginalURL as any)[key];
    } catch {
      // Some properties might be read-only
    }
  }
}

export function enableURLDebugging() {
  console.log('URL debugging enabled - invalid URLs will be logged to console');
}

export function disableURLDebugging() {
  window.URL = OriginalURL;
  console.log('URL debugging disabled');
}