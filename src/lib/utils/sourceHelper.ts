/**
 * Helper function to ensure ResearchSource objects have all required properties
 */
export function ensureSourceCompatibility(source: any): any {
  return {
    ...source,
    reliability: source.reliability ?? source.confidence ?? 70,
    lastVerified: source.lastVerified ?? source.lastUpdated ?? new Date().toISOString()
  };
}

/**
 * Process an array of sources to ensure compatibility
 */
export function ensureSourcesCompatibility(sources: any[]): any[] {
  return sources.map(ensureSourceCompatibility);
}