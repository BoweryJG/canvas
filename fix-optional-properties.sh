#!/bin/bash

# Auto-generated script to fix optional property access

# Fixing src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.marketData\.awareness/productIntel?\.marketData?\.awareness/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/doctorIntel\.salesStrategy\.objectionHandlers/doctorIntel?\.salesStrategy?\.objectionHandlers/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.competitiveLandscape\.marketShare/productIntel?\.competitiveLandscape?\.marketShare/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.marketData\.limitedTimeOffers\.length/productIntel?\.marketData?\.limitedTimeOffers?\.length/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.marketData\.adoptionRate/productIntel?\.marketData?\.adoptionRate/g' src/lib/enhancedEmailTemplates.ts
sed -i '' 's/productIntel\.competitiveLandscape/productIntel?\.competitiveLandscape/g' src/lib/enhancedEmailTemplates.ts

# Fixing src/lib/superIntelligentDoctorResearch.ts
sed -i '' 's/doctor: {},/doctor: '' as string,/g' src/lib/superIntelligentDoctorResearch.ts
sed -i '' 's/product: {},/product: '' as string,/g' src/lib/superIntelligentDoctorResearch.ts
sed -i '' 's/insights: {},/insights: [] as string[],/g' src/lib/superIntelligentDoctorResearch.ts
sed -i '' 's/keyPoints: {},/keyPoints: [] as string[],/g' src/lib/superIntelligentDoctorResearch.ts

echo "✅ Optional property fixes applied"
