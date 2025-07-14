/**
 * Utility functions for safe URL handling
 */

/**
 * Safely parse a URL and return the URL object or null if invalid
 */
export function safeParseURL(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Safely get hostname from a URL string
 * Returns the hostname or the original string if parsing fails
 */
export function safeGetHostname(url: string): string {
  const parsed = safeParseURL(url);
  return parsed ? parsed.hostname : url;
}

/**
 * Safely get domain (hostname without www) from a URL string
 * Returns the domain or the original string if parsing fails
 */
export function safeGetDomain(url: string): string {
  const parsed = safeParseURL(url);
  return parsed ? parsed.hostname.replace('www.', '') : url;
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  return safeParseURL(url) !== null;
}