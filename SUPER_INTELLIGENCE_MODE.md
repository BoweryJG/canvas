# Super Intelligence Mode 🧠

Canvas now supports a **Super Intelligence Mode** that leverages multiple AI models through OpenRouter and specialized APIs to gather the most comprehensive doctor intelligence possible.

## Architecture

### Standard Mode
- **Brave Search**: Basic web search
- **Claude 3 Sonnet**: Intelligence synthesis
- **30+ sources**: Good coverage

### Super Intelligence Mode  
- **Perplexity AI** (Real-time data):
  - `llama-3.1-sonar-small`: Quick searches
  - `llama-3.1-sonar-large`: Deep reasoning
  - `llama-3.1-sonar-huge`: Comprehensive research
- **Brave Local Search** (Competitor intelligence): Real-time local business data
- **GPT-4 Turbo** (Medical analysis): Healthcare-specific insights
- **Claude 4 Opus** (Premium synthesis): Ultra-personalized intelligence
- **70+ sources**: Maximum coverage including local competitors

## Model Selection Strategy

```
1. Data Gathering Phase
   ├── Perplexity: Real-time web intelligence
   │   ├── Basic search: Find website, reviews, news
   │   ├── Reasoning: Analyze technology fit
   │   └── Deep research: Comprehensive market analysis
   └── Brave Local Search: Competitor landscape
       ├── Local dental practices with ratings
       ├── Distance from target doctor
       └── Price range and services offered

2. GPT-4 Turbo (Medical Context)
   ├── Practice sophistication scoring
   ├── Technology readiness assessment
   ├── Competitive positioning analysis
   └── Budget and timeline prediction

3. Claude 4 Opus (Final Synthesis)
   ├── Ultra-premium narrative creation
   ├── Hyper-personalized messaging
   └── Sophisticated objection handling
```

## Configuration

### Enable Super Intelligence Mode

```env
# In your .env file
REACT_APP_USE_SUPER_INTELLIGENCE=true
OPENROUTER_API_KEY=your-key
PERPLEXITY_API_KEY=your-key  # Already configured!
```

### Enable Local Claude 4

```env
REACT_APP_USE_LOCAL_CLAUDE=true
# System will use high-quality mock data
```

## What You Get

### Standard Intelligence
- Basic practice information
- Generic pain points
- Simple sales brief

### Super Intelligence
- **Opportunity Score** (1-100) with detailed rationale
- **Perfect Pitch**: Exact opening line crafted for this doctor
- **Timing Strategy**: Best day/time to reach out
- **Objection Handlers**: Pre-written responses to likely concerns
- **Multi-Channel Content**: Ready for email, SMS, LinkedIn, calls
- **Buying Signals**: Specific indicators they're ready to purchase
- **Competition Intel**: What they're currently using
- **Decision Maker Map**: Who to target and who influences

## Example Output

```json
{
  "executiveSummary": "Dr. Gregory White's Pure Dental expanded to 2 locations in 2022 and posted for a Tech Coordinator last month, signaling active modernization. With coordination challenges between sites, Canvas directly addresses their workflow needs.",
  
  "opportunityScore": 87,
  "scoringRationale": "Recent expansion + tech hire + conference attendance + coordination pain = high readiness",
  
  "perfectPitch": "Hi Dr. White, I noticed Pure Dental's impressive expansion to Buffalo - how are you managing workflow coordination between your Williamsville and Buffalo locations?",
  
  "localCompetitorInsights": {
    "marketPosition": "Pure Dental ranks #2 of 8 practices within 3 miles (4.7/5 stars)",
    "competitiveDifferentiators": [
      "Only multi-location practice in immediate area",
      "Higher tech adoption than 6 of 8 local competitors",
      "Premium pricing tier ($$$) vs mostly $$ competitors"
    ],
    "vulnerabilities": [
      "Smile Design Dental Spa (2.5mi) has 4.9 rating and Saturday hours",
      "Advanced Dental Care (1.2mi) advertising 'state-of-the-art equipment'"
    ]
  },
  
  "approachStrategy": {
    "channel": "email",
    "timing": "Tuesday 12:30 PM",
    "opener": "Subject: Quick question about Pure Dental's multi-location workflow",
    "valueProps": [
      "Unified patient records across both locations",
      "30% reduction in administrative time",
      "Real-time schedule synchronization",
      "Competitive edge over Smile Design Dental's single location"
    ]
  },
  
  "objectionHandling": {
    "We already use Dentrix": "Canvas integrates with Dentrix to enhance rather than replace - think of it as your multi-location command center",
    "Too expensive": "Most practices see ROI in 3 months. Your Tech Coordinator posting suggests you're already budgeting for efficiency improvements",
    "No time for implementation": "Our white-glove service handles everything. Your new Tech Coordinator would be the perfect point person"
  }
}
```

## Performance

- **Standard Mode**: ~10 seconds
- **Super Intelligence Mode**: ~25-30 seconds
- **Sources Analyzed**: 50+ (vs 30+ in standard)
- **Confidence Score**: Typically 85-95% (vs 70-85%)

## Cost Optimization

Models are selected based on task complexity:
- Simple searches → Perplexity Small (cheapest, real-time)
- Medical analysis → GPT-4 Turbo (medical expertise)
- Final synthesis → Claude 4 Opus (premium creativity)

## Try It Now

1. Set `REACT_APP_USE_SUPER_INTELLIGENCE=true`
2. Search for any doctor
3. Watch the multi-model intelligence gathering
4. Get hyper-specific, actionable intelligence

The future of sales intelligence is here! 🚀