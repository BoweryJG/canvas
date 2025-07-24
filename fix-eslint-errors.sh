#!/bin/bash

# Fix unused variables by removing them
echo "Fixing unused variables..."

# Fix unused imports and variables in specific files
files=(
  "src/components/agents/CanvasAIPro.tsx"
  "src/lib/deepResearchReport.ts"
  "src/lib/enhancedDoctorIntelligence.ts"
  "src/lib/enhancedDoctorIntelligenceWithProgress.ts"
  "src/lib/enhancedPdfExport.ts"
  "src/lib/enhancedResearch.ts"
  "src/lib/enhancedSalesRepReports.ts"
  "src/lib/progressiveResearch.ts"
  "src/lib/researchAPIFallbackLogic.ts"
  "src/lib/researchOrchestrator.ts"
  "src/lib/semanticDoctorSearch.ts"
  "src/lib/socialMediaIntelligence.ts"
  "src/lib/streamlinedDoctorIntelligence.ts"
  "src/lib/superIntelligentDoctorResearch.ts"
  "src/lib/tieredResearch.ts"
  "src/lib/typescriptFixOrchestrator.ts"
  "src/lib/unifiedIntelligenceCore.ts"
  "src/lib/webResearch.ts"
  "src/lib/websiteDiscovery.ts"
  "src/pages/SharedIntelligence.tsx"
)

# Remove unused parameters by replacing them with _
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove unused imports (useAuth from CanvasAIPro.tsx)
    if [[ "$file" == "src/components/agents/CanvasAIPro.tsx" ]]; then
      sed -i '' '/import.*useAuth.*from/d' "$file"
    fi
    
    # Replace unused catch block variables with _
    sed -i '' 's/} catch ([[:alnum:]_]*) {/} catch (_) {/g' "$file"
    
    # Remove unused destructured variables
    sed -i '' 's/const { \([^}]*\), [[:alnum:]_]*: [[:alnum:]_]* } =/const { \1 } =/g' "$file"
  fi
done

echo "ESLint fixes applied!"