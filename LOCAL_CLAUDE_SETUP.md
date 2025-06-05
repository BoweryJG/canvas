# Local Claude 4 Integration

This project supports using Claude 4 through multiple methods:

## Configuration Options

### 1. OpenRouter (Default)
- Set `OPENROUTER_API_KEY` in your `.env` file
- The system will use OpenRouter's Claude 3 Opus endpoint

### 2. Local API Endpoint
If you have a local Claude API running:

```env
REACT_APP_USE_LOCAL_CLAUDE=true
REACT_APP_LOCAL_CLAUDE_ENDPOINT=http://localhost:8080/claude
REACT_APP_LOCAL_CLAUDE_KEY=your-local-key # optional
```

### 3. Claude Code Mode
For development with Claude Code:

```env
REACT_APP_USE_LOCAL_CLAUDE=true
# Don't set endpoint - system will use mock mode with high-quality data
```

### 4. Mock Mode (Development)
When no API keys are configured, the system automatically uses high-quality mock data that simulates Claude 4 responses.

## How It Works

The `Claude4LocalProcessor` class automatically detects your configuration:

1. **With OpenRouter**: Uses your API key to call Claude 3 Opus
2. **With Local API**: Sends requests to your local endpoint
3. **Claude Code Mode**: Generates premium mock data and logs prompts
4. **Mock Mode**: Returns realistic intelligence data for testing

## Benefits

- **No API costs** during development
- **Fast responses** with mock data
- **Realistic intelligence** that mimics Claude 4 quality
- **Easy switching** between modes via environment variables

## Example Mock Intelligence

When using mock mode, you'll get detailed intelligence including:
- Practice size and patient volume
- Technology stack with specific systems
- Market position and reputation
- Specific buying signals
- Decision maker information
- Detailed sales approach strategy

This allows full testing of the Canvas system without requiring API access.