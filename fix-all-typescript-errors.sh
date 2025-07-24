#!/bin/bash

# Comprehensive TypeScript Error Fix Script
# This script fixes all remaining TypeScript errors in the Canvas project

echo "🔧 Starting comprehensive TypeScript error fixes..."

# Fix 1: enhancedDoctorIntelligence.ts - Type '{}' and 'undefined' issues
echo "Fixing enhancedDoctorIntelligence.ts..."
sed -i '' 's/enhancedInsights: {},/enhancedInsights: {} as Record<string, unknown>,/g' src/lib/enhancedDoctorIntelligence.ts
sed -i '' 's/let enhancedInsights: Record<string, unknown> = undefined;/let enhancedInsights: Record<string, unknown> | undefined = undefined;/g' src/lib/enhancedDoctorIntelligence.ts

# Fix 2: ProgressCallback type incompatibility
echo "Fixing ProgressCallback type issues..."
# This needs a more complex fix - update the interface

# Fix 3: Optional property access in enhancedEmailTemplates.ts
echo "Fixing optional property access in enhancedEmailTemplates.ts..."
sed -i '' 's/productIntel\.marketData\.awareness/productIntel?.marketData?.awareness/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/doctorIntel\.salesStrategy\.objectionHandlers/doctorIntel?.salesStrategy?.objectionHandlers/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.competitiveLandscape\.marketShare/productIntel?.competitiveLandscape?.marketShare/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.marketData\.limitedTimeOffers\.length/productIntel?.marketData?.limitedTimeOffers?.length/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.marketData\.adoptionRate/productIntel?.marketData?.adoptionRate/g' src/lib/enhancedEmailTemplates.ts

# Fix 4: Property access on empty objects in enhancedEmailTemplates.ts and enhancedOutreachSystem.ts
echo "Fixing property access on empty objects..."
# These need type assertions or interface updates

# Fix 5: Type mismatches in superIntelligentDoctorResearch.ts
echo "Fixing type mismatches in superIntelligentDoctorResearch.ts..."
sed -i '' "s/doctor: {},/doctor: '' as string,/g" src/lib/superIntelligentDoctorResearch.ts
sed -i '' "s/product: {},/product: '' as string,/g" src/lib/superIntelligentDoctorResearch.ts
sed -i '' "s/insights: {},/insights: [] as string[],/g" src/lib/superIntelligentDoctorResearch.ts
sed -i '' "s/keyPoints: {},/keyPoints: [] as string[],/g" src/lib/superIntelligentDoctorResearch.ts

# Fix 6: Parameter types in tieredResearch.ts
echo "Fixing parameter types in tieredResearch.ts..."
sed -i '' 's/\.filter(r =>/(r: any) =>/g' src/lib/tieredResearch.ts
sed -i '' 's/\.map(r =>/(r: any) =>/g' src/lib/tieredResearch.ts

# Fix 7: Unused parameter in typescriptFixOrchestrator.ts
echo "Fixing unused parameters..."
sed -i '' 's/for (const \[categoryName, category\]/for (const [_categoryName, category]/g' src/lib/typescriptFixOrchestrator.ts

# Fix 8: NPIData type issues in unifiedIntelligenceCore.ts
echo "Fixing NPIData type issues..."
# This needs interface alignment or type assertions

# Fix 9: ScrapedWebsiteData interface mismatch
echo "Fixing ScrapedWebsiteData interface..."
# This needs a more complex fix to handle array properties

echo "✅ Basic fixes applied. Some complex type issues may need manual intervention."
echo ""
echo "Remaining issues that need manual fixes:"
echo "1. ProgressCallback interface alignment"
echo "2. Empty object property access (need proper typing)"
echo "3. NPIData and ScrapedWebsiteData interface mismatches"
echo "4. InstantIntelligence type mismatch in CanvasHomePremium.tsx"