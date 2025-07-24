#!/bin/bash

# Fix useState declarations with null to use undefined
echo "Fixing useState declarations..."

# List of files to fix
files=(
  "src/components/EnhancedResearchPanelWithRender.tsx"
  "src/App-fast.tsx"
  "src/hooks/useSubscriptionLimits.ts"
  "src/pages/AuthCallback.tsx"
  "src/pages/SharedIntelligence.tsx"
  "src/pages/MarketInsightsSimple.tsx"
  "src/auth/hooks.ts"
  "src/components/EnhancedResearchPanel.tsx"
  "src/components/EnhancedChatLauncher.tsx"
  "src/components/SubscriptionModal.tsx"
  "src/components/RepSpheresSearchPanel.tsx"
  "src/components/DoctorAutocomplete.tsx"
  "src/components/MultiChannelMagicLink.tsx"
  "src/components/EnhancedActionSuite.tsx"
  "src/components/CRMBCCSettings.tsx"
  "src/components/mobile-demo/DemoInvitation.tsx"
  "src/components/ShareIntelligenceModal.tsx"
  "src/auth/useSubscription.ts"
  "src/components/EnhancedNPILookup.tsx"
  "src/components/CanvasQuickLoginModal.tsx"
  "src/auth/useUnifiedSubscription.ts"
  "src/components/IntegratedCanvasExperience.tsx"
  "src/components/PricingPage.tsx"
  "src/components/ProgressiveOutreachPanel.tsx"
  "src/components/subscription/UnifiedPricingModal.tsx"
  "src/components/NavBar.tsx"
  "src/components/CinematicScanExperience.tsx"
  "src/components/MagicLinkAnalytics.tsx"
  "src/components/DoctorAutocompleteDebug.tsx"
  "src/components/PowerPackModal.tsx"
  "src/components/agents/ContextualInsights.tsx"
  "src/components/agents/EnhancedAgentSystem.tsx"
  "src/components/ProgressiveResearchPanel.tsx"
  "src/components/BatchAnalysisPanel.tsx"
  "src/components/agents/ChatInterface.tsx"
  "src/components/DeepIntelligenceScan.tsx"
  "src/components/CanvasMainSearch.tsx"
  "src/components/agents/CanvasAIPro.tsx"
  "src/components/SEOReportModal.tsx"
  "src/components/agents/EnhancedChatInterface.tsx"
  "src/components/agents/premium/CinematicChatInterface.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Replace useState<T | null>(null) with useState<T | undefined>(undefined)
    sed -i '' 's/useState<\([^>]*\) | null>(null)/useState<\1 | undefined>(undefined)/g' "$file"
    # Replace useState<T | null>(null) where T might contain spaces or complex types
    sed -i '' 's/useState<\([^>]*\)| null>(null)/useState<\1| undefined>(undefined)/g' "$file"
  else
    echo "Warning: $file not found"
  fi
done

echo "Fixing completed!"