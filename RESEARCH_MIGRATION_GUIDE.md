# Canvas Research System Migration Guide

## 🎯 TL;DR - Use This One Function

```typescript
import { unifiedCanvasResearch } from './lib/unifiedCanvasResearch';

// This is the ONLY function you should use for research
const result = await unifiedCanvasResearch(doctor, product, {
  mode: 'instant', // or 'legacy' or 'auto' (default)
  onInstantComplete: (instant) => {
    // Handle 3-second scan results
  },
  onDeepComplete: (deep) => {
    // Handle deep research results (SEO, social media, etc.)
  }
});
```

## ❌ Stop Using These (Deprecated)

1. ❌ `gatherComprehensiveDoctorIntelligenceWithProgress()` 
2. ❌ `baselineResearch()` directly
3. ❌ `conductNPIEnhancedResearch()`
4. ❌ `gatherStreamlinedDoctorIntelligence()`
5. ❌ `gatherSuperIntelligentDoctorResearch()`

## 🚀 What's New

### Instant Scan (3 seconds)
- Tech stack assessment
- Buying signals
- Digital presence score
- Quick competitive position

### Deep Research (Background)
- Psychological profiling
- SEO website analysis
- Social media intelligence (Instagram, Google Reviews)
- Competitor analysis with Perplexity
- Harvard/McKinsey-level sales content
- Obstacle mapping with responses

## 📊 Research Modes

### Mode: 'instant' (Default, Recommended)
```typescript
await unifiedCanvasResearch(doctor, product, {
  mode: 'instant',
  onInstantComplete: (result) => {
    // Shows in 3 seconds
    console.log(result.techStack);
    console.log(result.buyingSignals);
  },
  onDeepComplete: (result) => {
    // Shows when background research completes
    console.log(result.seoReport);
    console.log(result.socialMediaIntelligence);
    console.log(result.salesCollateral);
  }
});
```

### Mode: 'legacy' (Backward Compatible)
```typescript
const result = await unifiedCanvasResearch(doctor, product, {
  mode: 'legacy',
  progress: progressCallbacks
});

// Returns ResearchData in result.legacy
```

### Mode: 'auto' (System Decides)
Uses feature flags to determine best mode.

## 🔧 Environment Variables

```bash
# Feature flags (all default to true)
REACT_APP_USE_INSTANT_SCAN=true    # Use new instant scan system
REACT_APP_ENABLE_SOCIAL=true       # Enable social media scraping
REACT_APP_ENABLE_SEO=true          # Enable SEO reports
REACT_APP_USE_LEGACY=false         # Force legacy mode

# API Keys needed
PERPLEXITY_API_KEY=xxx             # For competitor research
APIFY_API_KEY=xxx                  # For social media scraping
```

## 📝 Migration Examples

### Before (Old Way)
```typescript
// ❌ Don't do this anymore
const research = await gatherComprehensiveDoctorIntelligenceWithProgress(
  doctor,
  product,
  progressCallbacks
);
```

### After (New Way)
```typescript
// ✅ Do this instead
await unifiedCanvasResearch(doctor, product, {
  mode: 'instant',
  onInstantComplete: (instant) => {
    setQuickResults(instant);
  },
  onDeepComplete: (deep) => {
    setFullResults(deep);
  }
});
```

## 🏗️ File Structure

```
src/lib/
├── unifiedCanvasResearch.ts      # ✅ USE THIS - Single entry point
├── instantCanvasResearch.ts      # Instant scan + deep research logic
├── socialMediaIntelligence.ts    # Apify social media scraping
├── baselineUSETHISONLYresearch.ts # Legacy research (still used internally)
├── enhancedDoctorIntelligenceWithProgress.ts # DEPRECATED - redirects to unified
├── npiEnhancedResearch.ts        # DEPRECATED
├── streamlinedDoctorIntelligence.ts # DEPRECATED
└── superIntelligentDoctorResearch.ts # DEPRECATED
```

## 🎯 Best Practices

1. **Always use `unifiedCanvasResearch()`** - It's the single source of truth
2. **Prefer 'instant' mode** - Gives users immediate feedback
3. **Handle both callbacks** - Instant (3s) and Deep (background)
4. **Check feature flags** - Use `getResearchConfig()` to see what's enabled

## 🚨 Common Mistakes

1. **Using old functions directly** - They're deprecated
2. **Not handling instant callback** - Users see nothing for 30+ seconds
3. **Expecting synchronous results** - Deep research runs in background
4. **Not setting API keys** - Social media and competitor research will fail silently

## 📊 Data Flow

```
User Input
    ↓
unifiedCanvasResearch()
    ↓
┌─────────────────┐
│ Instant Scan    │ (3 seconds)
│ - Tech stack    │
│ - Buying signals│
└────────┬────────┘
         ↓ onInstantComplete()
    User sees results
         ↓
┌─────────────────┐
│ Deep Research   │ (background)
│ - SEO Report    │
│ - Social Media  │
│ - Sales Content │
└────────┬────────┘
         ↓ onDeepComplete()
    Enhanced results
```

## 🔄 Gradual Migration

If you can't migrate everything at once:

1. Start with new features using `unifiedCanvasResearch()`
2. Set `mode: 'legacy'` for stable features
3. Gradually move to `mode: 'instant'` as you update UI
4. Remove deprecated imports once fully migrated