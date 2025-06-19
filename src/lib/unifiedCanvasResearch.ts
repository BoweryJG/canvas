/**
 * UNIFIED Canvas Research System - USE THIS ONLY
 * Single entry point for all doctor research
 * Eliminates confusion between different research modes
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { runCanvasResearch, type InstantScanResult, type DeepResearchResult } from './instantCanvasResearch';
import { baselineResearch } from './baselineUSETHISONLYresearch';
import { adaptiveResearch } from './adaptiveResearch';
import { streamlinedResearch } from './streamlinedResearch';
import type { ResearchData } from './webResearch';

// Feature flags for controlling which system to use
const FEATURE_FLAGS = {
  USE_INSTANT_SCAN: import.meta.env.VITE_USE_INSTANT_SCAN === 'true' || false, // Disabled when using adaptive
  USE_LEGACY_BASELINE: import.meta.env.VITE_USE_LEGACY === 'true' || false,
  USE_ADAPTIVE_AI: import.meta.env.VITE_USE_ADAPTIVE === 'true' || false, // Disabled - too many loops
  USE_STREAMLINED: import.meta.env.VITE_USE_STREAMLINED === 'true' || true, // NEW: Minimal API calls
  ENABLE_SOCIAL_MEDIA: import.meta.env.VITE_ENABLE_SOCIAL === 'true' || true,
  ENABLE_SEO_REPORT: import.meta.env.VITE_ENABLE_SEO === 'true' || true,
};

export type ResearchMode = 'instant' | 'legacy' | 'adaptive' | 'auto';

export interface UnifiedResearchOptions {
  mode?: ResearchMode;
  existingWebsite?: string;
  progress?: ResearchProgressCallback;
  onInstantComplete?: (result: InstantScanResult) => void;
  onDeepComplete?: (result: DeepResearchResult) => void;
}

export interface ResearchProgressCallback {
  updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources: (count: number) => void;
  updateConfidence: (score: number) => void;
  updateStage: (stage: string) => void;
  updateStrategy?: (strategy: string) => void;
}

export interface UnifiedResearchResult {
  mode: 'instant' | 'legacy' | 'adaptive';
  instant?: InstantScanResult;
  deep?: DeepResearchResult;
  legacy?: ResearchData;
  adaptive?: ResearchData | any; // ExtendedResearchData
  error?: string;
}

/**
 * MAIN ENTRY POINT - Use this for all research
 */
export async function unifiedCanvasResearch(
  doctor: Doctor,
  product: string,
  options: UnifiedResearchOptions = {}
): Promise<UnifiedResearchResult> {
  const { 
    mode = 'auto', 
    existingWebsite,
    progress,
    onInstantComplete,
    onDeepComplete
  } = options;
  
  console.log('🎯 Unified Canvas Research starting for:', doctor.displayName);
  console.log('📋 Mode:', mode);
  console.log('🔧 Feature flags:', FEATURE_FLAGS);
  
  try {
    // Determine which mode to use
    const useStreamlined = mode === 'streamlined' || 
                          (mode === 'auto' && FEATURE_FLAGS.USE_STREAMLINED);
    const useAdaptive = !useStreamlined && (mode === 'adaptive' || 
                        (mode === 'auto' && FEATURE_FLAGS.USE_ADAPTIVE_AI));
    const useInstantScan = !useStreamlined && !useAdaptive && (mode === 'instant' || 
                          (mode === 'auto' && FEATURE_FLAGS.USE_INSTANT_SCAN));
    
    if (useStreamlined) {
      console.log('🚀 Using STREAMLINED system (minimal API calls)');
      
      // Use the new streamlined research
      const streamlinedResult = await streamlinedResearch(
        doctor,
        product,
        progress
      );
      
      return {
        mode: 'adaptive', // Return as adaptive for compatibility
        adaptive: streamlinedResult
      };
      
    } else if (useAdaptive) {
      console.log('🧠 Using ADAPTIVE AI system with Sequential Thinking');
      
      // Use the new adaptive research with intelligent routing
      const adaptiveResult = await adaptiveResearch(
        doctor,
        product,
        existingWebsite,
        progress
      );
      
      return {
        mode: 'adaptive',
        adaptive: adaptiveResult
      };
      
    } else if (useInstantScan) {
      console.log('⚡ Using INSTANT SCAN system (3-second + deep research)');
      
      // Use the instant + deep research system
      await runCanvasResearch(
        doctor,
        product,
        onInstantComplete,
        onDeepComplete
      );
      
      // Note: Results are delivered via callbacks
      return {
        mode: 'instant',
        instant: undefined, // Will be delivered via callback
        deep: undefined     // Will be delivered via callback
      };
      
    } else {
      console.log('🏛️ Using LEGACY baseline system');
      
      // Fall back to legacy system
      const legacyResult = await baselineResearch(
        doctor,
        product,
        existingWebsite,
        progress
      );
      
      return {
        mode: 'legacy',
        legacy: legacyResult
      };
    }
    
  } catch (error) {
    console.error('❌ Unified research error:', error);
    
    return {
      mode: mode === 'instant' ? 'instant' : 'legacy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Simple wrapper for components that just want basic research
 */
export async function simpleCanvasResearch(
  doctor: Doctor,
  product: string,
  onComplete: (result: ResearchData | InstantScanResult) => void
): Promise<void> {
  await unifiedCanvasResearch(doctor, product, {
    mode: 'auto',
    onInstantComplete: (instant) => {
      // Convert instant result to ResearchData format for compatibility
      const compatibleResult: ResearchData = {
        doctorName: instant.doctor.name,
        practiceInfo: {
          name: instant.doctor.practice,
          specialties: [instant.doctor.specialty]
        },
        credentials: {
          boardCertifications: [instant.doctor.specialty]
        },
        reviews: {},
        businessIntel: {
          practiceType: instant.quickInsights.practiceSize,
          patientVolume: instant.quickInsights.patientVolume,
          marketPosition: instant.quickInsights.competitivePosition
        },
        sources: [],
        confidenceScore: instant.confidence,
        completedAt: new Date().toISOString()
      };
      
      onComplete(compatibleResult);
    }
  });
}

/**
 * Get current research configuration
 */
export function getResearchConfig() {
  return {
    mode: FEATURE_FLAGS.USE_INSTANT_SCAN ? 'instant' : 'legacy',
    features: {
      instantScan: FEATURE_FLAGS.USE_INSTANT_SCAN,
      socialMedia: FEATURE_FLAGS.ENABLE_SOCIAL_MEDIA,
      seoReport: FEATURE_FLAGS.ENABLE_SEO_REPORT,
      legacyMode: FEATURE_FLAGS.USE_LEGACY_BASELINE
    },
    description: FEATURE_FLAGS.USE_INSTANT_SCAN 
      ? '3-second instant scan + deep background research with SEO & social media'
      : 'Legacy baseline research mode'
  };
}

/**
 * FOR MIGRATION: Map old function calls to new unified system
 */
export async function gatherComprehensiveDoctorIntelligenceWithProgress(
  doctor: Doctor,
  product: string,
  progress: ResearchProgressCallback
): Promise<ResearchData> {
  console.warn('⚠️ Using deprecated function. Please migrate to unifiedCanvasResearch()');
  
  const result = await unifiedCanvasResearch(doctor, product, {
    mode: 'legacy', // Use legacy for backward compatibility
    progress
  });
  
  if (result.legacy) {
    return result.legacy;
  }
  
  // Convert instant results if that's what we got
  throw new Error('Unexpected research mode in legacy wrapper');
}