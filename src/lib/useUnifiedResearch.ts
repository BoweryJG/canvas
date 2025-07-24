/**
 * React Hook for Unified Research System
 * Connects UI components to the adaptive research pipeline
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { type Doctor } from '../components/DoctorAutocomplete';
import { unifiedCanvasResearch, type ResearchProgressCallback } from './unifiedCanvasResearch';
import { type ResearchData } from './webResearch';

export interface UseUnifiedResearchState {
  isResearching: boolean;
  progress: ResearchProgress | null;
  result: ResearchData | null;
  error: string | null;
}

export interface ResearchProgress {
  stage: string;
  currentStep: string;
  percentComplete: number;
  sourcesFound: number;
  confidenceScore: number;
  estimatedTimeRemaining: number;
  steps: StepProgress[];
  strategy?: string;
}

interface StepProgress {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'found';
  result?: string;
}

export function useUnifiedResearch() {
  const [state, setState] = useState<UseUnifiedResearchState>({
    isResearching: false,
    progress: null,
    result: null,
    error: null
  });

  const startTimeRef = useRef<number>(0);
  const stepsRef = useRef<StepProgress[]>([
    { id: 'analysis', label: 'AI Analysis', status: 'pending' },
    { id: 'website', label: 'Practice Website', status: 'pending' },
    { id: 'reviews', label: 'Reviews & Ratings', status: 'pending' },
    { id: 'competition', label: 'Competitor Analysis', status: 'pending' },
    { id: 'synthesis', label: 'Final Synthesis', status: 'pending' }
  ]);

  const updateProgress = useCallback((updates: Partial<ResearchProgress>) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress!,
        ...updates,
        steps: stepsRef.current
      }
    }));
  }, []);

  const progressCallback: ResearchProgressCallback = useMemo(() => ({
    updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => {
      const stepIndex = stepsRef.current.findIndex(s => s.id === stepId);
      if (stepIndex !== -1) {
        stepsRef.current[stepIndex] = {
          ...stepsRef.current[stepIndex],
          status,
          result
        };
        
        // Calculate overall progress
        const completedSteps = stepsRef.current.filter(s => 
          s.status === 'completed' || s.status === 'found'
        ).length;
        const percentComplete = Math.round((completedSteps / stepsRef.current.length) * 100);
        
        updateProgress({ 
          steps: [...stepsRef.current],
          percentComplete,
          currentStep: stepsRef.current.find(s => s.status === 'active')?.label || ''
        });
      }
    },
    
    updateSources: (count: number) => {
      updateProgress({ sourcesFound: count });
    },
    
    updateConfidence: (score: number) => {
      updateProgress({ confidenceScore: score });
    },
    
    updateStage: (stage: string) => {
      updateProgress({ stage });
    },
    
    updateStrategy: (strategy: string) => {
      updateProgress({ strategy });
    }
  }), [updateProgress]);

  const startResearch = useCallback(async (
    doctor: Doctor,
    product: string,
    existingWebsite?: string
  ) => {
    // Reset state
    setState({
      isResearching: true,
      progress: {
        stage: 'Initializing...',
        currentStep: 'Starting research',
        percentComplete: 0,
        sourcesFound: 0,
        confidenceScore: 0,
        estimatedTimeRemaining: 30,
        steps: stepsRef.current.map(s => ({ ...s, status: 'pending' }))
      },
      result: null,
      error: null
    });

    startTimeRef.current = Date.now();

    try {
      // Start research with progress tracking
      const result = await unifiedCanvasResearch(doctor, product, {
        mode: 'adaptive', // Use new adaptive mode
        existingWebsite,
        progress: progressCallback
      });

      // Handle result based on mode
      if (result.error) {
        throw new Error(result.error);
      }

      let finalData: ResearchData;
      
      if (result.adaptive) {
        finalData = result.adaptive;
      } else if (result.legacy) {
        finalData = result.legacy;
      } else {
        throw new Error('No research data returned');
      }

      setState(prev => ({
        ...prev,
        isResearching: false,
        result: finalData,
        progress: {
          ...prev.progress!,
          stage: 'Complete',
          currentStep: 'Research finished',
          percentComplete: 100,
          confidenceScore: finalData.confidenceScore || 0
        }
      }));

      return finalData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isResearching: false,
        error: errorMessage,
        progress: null
      }));
      throw error;
    }
  }, [progressCallback]);

  const reset = useCallback(() => {
    setState({
      isResearching: false,
      progress: null,
      result: null,
      error: null
    });
    stepsRef.current = stepsRef.current.map(s => ({ ...s, status: 'pending', result: undefined }));
  }, []);

  return {
    ...state,
    startResearch,
    reset
  };
}

export default useUnifiedResearch;