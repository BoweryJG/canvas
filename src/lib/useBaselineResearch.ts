/**
 * Simple wrapper to use the baseline research
 * This replaces the complex intelligence gathering
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { baselineResearch } from './baselineUSETHISONLYresearch';

interface ProgressCallback {
  updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources: (count: number) => void;
  updateConfidence: (score: number) => void;
  updateStage: (stage: string) => void;
}

export async function gatherBaselineIntelligence(
  doctor: Doctor,
  product: string,
  progress: ProgressCallback,
  existingWebsite?: string
) {
  console.log('🚀 Using BASELINE research for:', doctor.displayName);
  
  // Convert doctor object to include any existing website
  const doctorWithWebsite = {
    ...doctor,
    practiceWebsite: existingWebsite || (doctor as any).practiceWebsite || (doctor as any).website
  };
  
  // Use the baseline research
  return baselineResearch(
    doctorWithWebsite,
    product,
    doctorWithWebsite.practiceWebsite,
    progress
  );
}