# Canvas Research Integration Analysis

## Current Integration Points

### 1. React Components Using Research

**Components that trigger research:**
- `EnhancedResearchPanel.tsx` - Uses `ProgressiveResearchEngine` and `conductEnhancedResearch`
- `EnhancedResearchPanelWithRender.tsx` - Uses `useRenderBackend` hook to call backend
- `UnifiedResearchPanel.tsx` - Switches between the two panels above based on backend preference

**Key Finding:** None of these components directly use the new `unifiedCanvasResearch` system!

### 2. Research Systems Available

1. **Legacy Systems (Still Being Used):**
   - `ProgressiveResearchEngine` (from `progressiveResearch.ts`)
   - `conductEnhancedResearch` (from `enhancedWebResearch.ts`)

2. **New Unified System (NOT Connected to UI):**
   - `unifiedCanvasResearch` (from `unifiedCanvasResearch.ts`)
   - `adaptiveResearch` (from `adaptiveResearch.ts`) - with Sequential Thinking
   - `sequentialThinkingResearch.ts` - Contains the AI reasoning logic

### 3. Sequential Thinking Integration Status

**Current State:**
- The Sequential Thinking logic exists in `sequentialThinkingResearch.ts`
- It's imported and used by `adaptiveResearch.ts`
- The `unifiedCanvasResearch` can use adaptive mode
- **BUT:** The actual MCP tool connection is simulated using OpenRouter

**Missing MCP Connection:**
```typescript
// In sequentialThinkingResearch.ts line 36-61
async function callSequentialThinking(params: {...}): Promise<SequentialThought> {
  // This would call the actual MCP Sequential Thinking tool
  // For now, we'll integrate with OpenRouter to simulate
  const prompt = `...`;
  const response = await callOpenRouter(prompt, 'anthropic/claude-opus-4');
  // ...
}
```

### 4. API Endpoints Configuration

All API endpoints are properly configured in `apiEndpoints.ts`:
- Brave Search ✓
- Firecrawl ✓
- Perplexity ✓
- OpenRouter ✓
- Local Search ✓

### 5. Missing Connections

1. **UI to Unified Research:**
   - Components still use old research functions
   - Need to update `EnhancedResearchPanel.tsx` to use `unifiedCanvasResearch`
   
2. **Sequential Thinking MCP Tool:**
   - Currently simulated with OpenRouter
   - Need actual MCP tool integration
   
3. **Progress Callbacks:**
   - The adaptive research supports progress callbacks
   - But the UI components aren't passing them through

## Recommended Fixes

### 1. Connect UI to Unified Research
Update `EnhancedResearchPanel.tsx` to use the unified system:

```typescript
import { unifiedCanvasResearch } from '../lib/unifiedCanvasResearch';

// In handleResearchSubmit:
const result = await unifiedCanvasResearch(doctor, product, {
  mode: 'adaptive',
  progress: {
    updateStep: (stepId, status, result) => {
      // Update UI progress
    },
    updateSources: (count) => {
      // Update source count
    },
    updateConfidence: (score) => {
      // Update confidence display
    },
    updateStage: (stage) => {
      // Update stage display
    }
  }
});
```

### 2. Add MCP Sequential Thinking Tool
Create `src/lib/mcp/sequentialThinking.ts`:

```typescript
export async function callSequentialThinkingMCP(params: {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
}): Promise<SequentialThought> {
  // Actual MCP tool call implementation
  const response = await window.mcp.call('sequential-thinking', 'sequentialthinking', params);
  return response;
}
```

### 3. Update Research Flow
The flow should be:
1. UI Component → `unifiedCanvasResearch` 
2. → `adaptiveResearch` (if mode is adaptive)
3. → `sequentialThinkingResearch` (for AI reasoning)
4. → MCP Sequential Thinking Tool (for actual reasoning)

### 4. Feature Flag Control
The system is ready with feature flags in `unifiedCanvasResearch.ts`:
- `USE_ADAPTIVE_AI` is set to `true` by default
- This should automatically route to the Sequential Thinking system

## Action Items

1. **Update UI Components** to use `unifiedCanvasResearch` instead of legacy functions
2. **Implement MCP Tool Connection** for Sequential Thinking
3. **Add Progress UI** to show Sequential Thinking analysis stages
4. **Test End-to-End** from UI → Unified → Adaptive → Sequential Thinking
5. **Remove Legacy Code** once new system is verified working