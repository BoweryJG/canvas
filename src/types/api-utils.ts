/**
 * API Utility Functions
 * Helper functions for handling API responses
 */

// Helper function to safely extract string content from various response types
export function extractStringContent(response: any): string {
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