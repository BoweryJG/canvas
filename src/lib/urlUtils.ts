/**
 * Utility functions for safe URL handling
 */

/**
 * Safely parse a URL and return the URL object or null if invalid
 * Handles both absolute URLs and relative URLs with a base
 */
export function safeParseURL(url: string, base?: string): URL | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // If it's a relative URL and we have a base, use it
    if (base && !url.match(/^https?:\/\//)) {
      return new URL(url, base);
    }
    // Otherwise try to parse as absolute URL
    return new URL(url);
  } catch {
    // If that fails and it looks like a domain without protocol, try adding https
    if (!url.match(/^https?:\/\//) && url.match(/^[\w-]+(\.[\w-]+)+/)) {
      try {
        return new URL(`https://${url}`);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Safely get hostname from a URL string
 * Returns the hostname or the original string if parsing fails
 */
export function safeGetHostname(url: string, base?: string): string {
  const parsed = safeParseURL(url, base);
  return parsed ? parsed.hostname : url;
}

/**
 * Safely get domain (hostname without www) from a URL string
 * Returns the domain or the original string if parsing fails
 */
export function safeGetDomain(url: string, base?: string): string {
  const parsed = safeParseURL(url, base);
  return parsed ? parsed.hostname.replace('www.', '') : url;
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string, base?: string): boolean {
  return safeParseURL(url, base) !== null;
}

/**
 * Ensure a URL has a protocol (https by default)
 */
export function ensureProtocol(url: string, defaultProtocol = 'https'): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // If it already has a protocol, return as-is
  if (url.match(/^https?:\/\//)) {
    return url;
  }
  
  // If it looks like a domain, add the protocol
  if (url.match(/^[\w-]+(\.[\w-]+)+/)) {
    return `${defaultProtocol}://${url}`;
  }
  
  // Otherwise return as-is (might be a relative path)
  return url;
}