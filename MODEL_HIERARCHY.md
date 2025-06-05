# Canvas AI Model Hierarchy 🧠

## Current Model Stack (Best to Good)

### 1. **Claude 4 Opus** (`anthropic/claude-opus-4-20250514`)
- **Role**: Premium synthesis & personalization
- **Strengths**: Nuanced understanding, creative excellence, strategic insights
- **Use**: Final intelligence synthesis, outreach generation
- **Cost**: $$$$ (Premium)

### 2. **GPT-4 Turbo** (`openai/gpt-4-turbo`)
- **Role**: Medical domain expertise
- **Strengths**: Healthcare knowledge, technical analysis, pattern recognition
- **Use**: Medical context analysis, practice scoring
- **Cost**: $$$ (High)

### 3. **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet-20241022`)
- **Role**: Fast, reliable fallback
- **Strengths**: Speed + quality balance, structured output
- **Use**: Fallback when Claude 4 unavailable
- **Cost**: $$ (Moderate)

### 4. **Perplexity Sonar Models**
- **Sonar Huge** (`llama-3.1-sonar-huge-128k-online`)
  - Role: Deep research with real-time data
  - Use: Comprehensive market analysis
- **Sonar Large** (`llama-3.1-sonar-large-128k-online`)
  - Role: Reasoning with web access
  - Use: Technology fit analysis
- **Sonar Small** (`llama-3.1-sonar-small-128k-online`)
  - Role: Quick web searches
  - Use: Finding websites, basic info
- **Cost**: $ to $$ (Efficient)

### 5. **Claude 3 Sonnet** (`anthropic/claude-3-sonnet`)
- **Role**: Legacy fallback
- **Use**: When newer models unavailable
- **Cost**: $$ (Moderate)

## Intelligence Gathering Flow

```
1. Perplexity Sonar (Real-time data)
   ↓
2. GPT-4 Turbo (Medical analysis)
   ↓
3. Claude 4 Opus (Premium synthesis)
   ↓
4. Multi-channel ready content
```

## Fallback Chain

```
Claude 4 Opus
  ↓ (if unavailable)
Claude 3.5 Sonnet
  ↓ (if unavailable)
Local Claude processor
  ↓ (if unavailable)
High-quality mock data
```

## Configuration Modes

1. **Super Intelligence Mode**: All models active
2. **Standard Mode**: Brave + Claude 3.5 Sonnet
3. **Local Mode**: Mock data with Claude patterns
4. **Development Mode**: Fast mocks, no API calls

## Model Selection Logic

- **Need real-time data?** → Perplexity
- **Medical analysis?** → GPT-4 Turbo
- **Final synthesis?** → Claude 4 Opus
- **Quick analysis?** → Claude 3.5 Sonnet
- **No API access?** → Local processor

## Cost per Intelligence Report

- **Super Mode**: ~$0.15-0.20 per doctor
- **Standard Mode**: ~$0.03-0.05 per doctor
- **Local Mode**: $0 (mock data)

Choose your mode based on:
- **Demo/Testing**: Local mode
- **Regular use**: Standard mode
- **High-value targets**: Super mode
- **Enterprise**: Custom model mix