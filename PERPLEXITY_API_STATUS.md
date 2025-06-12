# Perplexity API Status

## Current Issue
The Perplexity API is returning 500 errors. This could be due to:
1. Invalid or expired API key
2. Rate limiting
3. Service outage
4. Incorrect API endpoint or parameters

## Current API Key
`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`

## Temporary Solution
The app now has robust fallback mechanisms:
- When Perplexity fails, it uses Yomi-specific default content
- PDFs now open in browser tabs instead of downloading
- Error handling prevents crashes

## To Fix Permanently
1. Check if the API key is still valid at https://www.perplexity.ai/settings/api
2. Consider implementing OpenRouter as primary with Perplexity as fallback
3. Add better error logging to see exact API response

## Fallback Content
When API fails, the system provides:
- Yomi-specific tactical briefs
- Robotic surgery value propositions
- Pre-written email/SMS templates
- 95% confidence score for NPI-verified doctors