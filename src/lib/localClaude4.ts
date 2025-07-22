/**
 * Local Claude 4 Integration
 * Allows using Claude 4 through local API or Claude Code
 */

interface LocalClaudeConfig {
  useLocal: boolean;
  localEndpoint?: string;
  apiKey?: string;
}

// Check if we should use local Claude 4
export function getClaudeConfig(): LocalClaudeConfig {
  // Check for environment variables
  const useLocalClaude = process.env.REACT_APP_USE_LOCAL_CLAUDE === 'true';
  const localClaudeEndpoint = process.env.REACT_APP_LOCAL_CLAUDE_ENDPOINT;
  const localClaudeKey = process.env.REACT_APP_LOCAL_CLAUDE_KEY;
  
  return {
    useLocal: useLocalClaude || !!localClaudeEndpoint,
    localEndpoint: localClaudeEndpoint || 'http://localhost:8080/claude',
    apiKey: localClaudeKey
  };
}

/**
 * Call Claude 4 locally
 */
export async function callLocalClaude4(prompt: string): Promise<any> {
  const config = getClaudeConfig();
  
  if (!config.useLocal) {
    throw new Error('Local Claude not configured');
  }
  
  try {
    console.log('🤖 Calling local Claude 4...');
    
    // Option 1: If you have a local API endpoint
    if (config.localEndpoint) {
      const response = await fetch(config.localEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`Local Claude error: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Option 2: Return a signal to use Claude Code directly
    // This would require manual intervention but ensures Claude 4 quality
    return {
      _localClaude: true,
      prompt: prompt,
      instruction: "Please process this prompt with Claude 4 and return the JSON response"
    };
    
  } catch (error) {
    console.error('Local Claude 4 error:', error);
    throw error;
  }
}

/**
 * Enhanced callClaude that checks for local Claude first
 */
export async function callClaudeWithLocalFallback(
  prompt: string, 
  preferredModel: string = 'anthropic/claude-3-5-sonnet-20241022'
): Promise<any> {
  const config = getClaudeConfig();
  
  // Try local Claude 4 first if configured
  if (config.useLocal) {
    try {
      const localResponse = await callLocalClaude4(prompt);
      
      // If it's a signal to use Claude Code manually
      if (localResponse._localClaude) {
        console.log('📋 Local Claude 4 prompt ready for manual processing');
        console.log('Prompt:', localResponse.prompt);
        
        // For now, continue to OpenRouter as fallback
        // In production, this could pause and wait for manual input
      } else {
        return localResponse;
      }
    } catch (error) {
      console.log('Local Claude not available, falling back to OpenRouter');
    }
  }
  
  // Fall back to Claude API
  const { callClaude } = await import('./apiEndpoints');
  // Map old model names to new ones
  let mappedModel = preferredModel;
  if (preferredModel === 'anthropic/claude-3-5-sonnet-20241022') {
    mappedModel = 'claude-3-5-sonnet-20241022';
  }
  return callClaude(prompt, mappedModel);
}