# Doctor Verification System Architecture

## Overview

This sophisticated doctor verification system prioritizes finding actual practice websites over directory listings, using multiple verification signals and a learning-based approach to improve accuracy over time.

## Key Components

### 1. **Doctor Verification Function** (`doctor-verification.ts`)
Primary verification endpoint that analyzes search results and scores them based on multiple signals.

**Features:**
- Scoring system with weighted signals
- Practice website identification
- Directory deprioritization
- SSL and contact info verification
- Confidence levels (high/medium/low)

**Scoring Weights:**
- Practice Website: 40 points
- Practice Name Match: 20 points
- Custom Domain: 15 points
- Location Match: 10 points
- Social Media: 5 points
- Directory Listing: 5 points (low priority)
- SSL Certificate: 3 points
- Contact Info: 2 points

### 2. **Practice Finder Function** (`practice-finder.ts`)
Specialized function for discovering practice websites using intelligent search strategies.

**Search Strategies:**
- Exact practice name search
- Domain-style search (e.g., "puredental.com")
- Practice name with location
- Extracted practice patterns
- Alternative search patterns

**Key Features:**
- Multiple search strategy execution
- Practice name extraction
- Domain pattern recognition
- Result deduplication
- Confidence scoring

### 3. **Comprehensive Verification Function** (`comprehensive-verification.ts`)
Multi-source verification system that combines NPI registry, web presence, and social media.

**Verification Layers:**
1. **NPI Registry Verification**
   - Official government database lookup
   - Name and location matching
   - Specialty and credential extraction

2. **Practice Website Discovery**
   - Leverages practice-finder function
   - Domain verification
   - Practice name confirmation

3. **Web Presence Verification**
   - Multiple search result analysis
   - Cross-reference verification
   - Confidence scoring

4. **Social Media Verification** (Deep mode)
   - Facebook, Instagram, LinkedIn search
   - Profile verification
   - Secondary confirmation

**Verification Depths:**
- `quick`: NPI + basic web search
- `standard`: NPI + practice finder + web verification
- `deep`: All sources including social media

### 4. **Verification Feedback System** (`verification-feedback.ts`)
Learning system that improves based on user feedback.

**Learning Patterns:**
- Practice name patterns
- Domain patterns
- Search term effectiveness
- Success/failure tracking

**Feedback Types:**
- `correct`: Verification was accurate
- `incorrect`: Verification failed
- `partial`: Some information was correct

## Usage Examples

### 1. Basic Doctor Verification
```typescript
POST /doctor-verification
{
  "doctorName": "Greg White",
  "practiceName": "Pure Dental",
  "location": "Buffalo, NY",
  "specialty": "Dentistry"
}
```

### 2. Practice Website Discovery
```typescript
POST /practice-finder
{
  "searchTerms": "greg white pure dental buffalo",
  "knownPracticeName": "Pure Dental",
  "location": "Buffalo, NY",
  "includeAlternativeSearches": true
}
```

### 3. Comprehensive Verification
```typescript
POST /comprehensive-verification
{
  "doctorName": "Greg White",
  "searchHints": {
    "practiceName": "Pure Dental",
    "location": "Buffalo, NY"
  },
  "verificationDepth": "deep"
}
```

### 4. Feedback Submission
```typescript
POST /verification-feedback
{
  "verificationId": "verify_1234567890_abc123",
  "feedbackType": "correct",
  "userConfirmedData": {
    "practiceName": "Pure Dental",
    "website": "https://puredental.com/buffalo",
    "isOfficialWebsite": true
  }
}
```

## Verification Process Flow

```
1. User Input
   ├── Doctor Name (required)
   ├── Practice Name (optional but helpful)
   ├── Location (optional but helpful)
   └── NPI (optional)

2. Search Strategy Generation
   ├── Exact practice name search
   ├── Domain-style variations
   ├── Location-based searches
   └── Alternative patterns

3. Multi-Source Verification
   ├── NPI Registry Lookup
   ├── Web Search Analysis
   ├── Practice Website Discovery
   └── Social Media Verification

4. Result Scoring & Ranking
   ├── Apply scoring weights
   ├── Calculate confidence levels
   ├── Deduplicate results
   └── Sort by relevance

5. User Confirmation
   ├── Present top results
   ├── Request confirmation
   └── Collect feedback

6. Learning & Improvement
   ├── Process feedback
   ├── Update patterns
   ├── Adjust confidence scores
   └── Store verified data
```

## Key Insights from Example

The system successfully handles the "greg white pure dental buffalo" → "puredental.com/buffalo" case by:

1. **Practice Name Recognition**: Identifies "Pure Dental" as the practice name
2. **Domain Pattern Matching**: Recognizes that practice names often translate to domains (pure dental → puredental.com)
3. **Location Verification**: Confirms Buffalo location in URL path
4. **Directory Deprioritization**: Ranks actual practice website above Healthgrades, Vitals, etc.

## Best Practices

1. **Always Request Practice Name**: The practice name is the strongest signal for finding official websites
2. **Use Multiple Search Strategies**: Don't rely on a single search approach
3. **Verify Through Multiple Sources**: Cross-reference NPI, web, and social media
4. **Learn from Feedback**: Continuously improve patterns based on user confirmations
5. **Prioritize Custom Domains**: Real practices typically have custom domains, not subdirectories

## Future Enhancements

1. **Database Integration**: Store verified practice websites permanently
2. **ML Pattern Recognition**: Use machine learning for pattern detection
3. **API Rate Limiting**: Implement proper rate limiting for external APIs
4. **Caching Layer**: Cache verified results for faster subsequent lookups
5. **Regional Variations**: Handle different naming conventions by region
6. **Multi-language Support**: Extend to non-English practice names

## Security Considerations

1. **Input Validation**: Sanitize all user inputs
2. **API Key Protection**: Use environment variables for API keys
3. **Rate Limiting**: Prevent abuse of verification endpoints
4. **Data Privacy**: Don't store sensitive patient information
5. **CORS Configuration**: Properly configure cross-origin requests