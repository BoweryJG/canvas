/**
 * Direct Anthropic API Integration
 * Call Claude directly without going through OpenRouter
 */

import { withGlobalRateLimit, globalOpenRouterLimiter } from './globalRateLimiter';

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null | string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Anthropic Claude API directly
 */
export async function callAnthropicDirect(
  prompt: string, 
  model: string = 'claude-3-5-sonnet-20241022',
  userId?: string
): Promise<string> {
  // Use the same rate limiter as OpenRouter for consistency
  return withGlobalRateLimit(globalOpenRouterLimiter, 'anthropic-direct', userId, async () => {
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('No Anthropic API key found in environment variables');
      throw new Error('Anthropic API key not configured');
    }

    try {
      console.log(`🤖 Calling Anthropic ${model} directly...`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Anthropic API error:', response.status, errorData);
        throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: AnthropicResponse = await response.json();
      console.log(`✅ Anthropic ${model} completed successfully`);
      
      // Extract the text content from the response
      const content = data.content?.[0]?.text || '';
      
      return content;
    } catch (error) {
      console.error('Direct Anthropic API error:', error);
      throw error;
    }
  });
}

/**
 * Drop-in replacement for callOpenRouter that uses direct Anthropic API
 */
export async function callAnthropicInsteadOfOpenRouter(
  prompt: string, 
  model: string = 'anthropic/claude-3.5-sonnet',
  userId?: string
): Promise<string> {
  // Map OpenRouter model names to Anthropic model names
  const modelMap: Record<string, string> = {
    'anthropic/claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
    'anthropic/claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
    'anthropic/claude-opus-4': 'claude-3-5-sonnet-20241022', // Map Opus 4 to Sonnet
    'claude-opus-4-20250514': 'claude-3-5-sonnet-20241022', // Map Opus 4 to Sonnet
    'anthropic/claude-3-sonnet-20240229': 'claude-3-sonnet-20240229',
    'anthropic/claude-3-haiku-20240307': 'claude-3-haiku-20240307'
  };
  
  const anthropicModel = modelMap[model] || 'claude-3-5-sonnet-20241022';
  
  try {
    const response = await callAnthropicDirect(prompt, anthropicModel, userId);
    
    // Return in a format similar to OpenRouter for compatibility
    return {
      choices: [{
        message: {
          content: response
        }
      }]
    };
  } catch (error) {
    console.error('Failed to call Anthropic directly:', error);
    
    // Return a fallback response structure
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            error: 'Failed to analyze',
            fallback: true
          })
        }
      }]
    };
  }
}