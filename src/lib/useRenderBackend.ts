/**
 * React Hook for Render Backend Integration
 * Provides easy access to backend research capabilities
 */

import { useState, useCallback, useEffect } from 'react';
import { conductResearch, checkBackendHealth } from './renderBackendAPI';
import { useAuth } from '../auth/hooks';

export interface ResearchProgress {
  isLoading: boolean;
  progress: number;
  stage: string;
  message: string;
  error: string | null;
}

export function useRenderBackend() {
  const { user } = useAuth();
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress>({
    isLoading: false,
    progress: 0,
    stage: '',
    message: '',
    error: null
  });

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendHealthy);
  }, []);

  /**
   * Run research through Render backend
   */
  const runResearch = useCallback(async (
    doctor: any,
    product: string
  ) => {
    // Reset progress
    setResearchProgress({
      isLoading: true,
      progress: 0,
      stage: 'starting',
      message: 'Initializing research...',
      error: null
    });

    try {
      const result = await conductResearch(
        doctor,
        product,
        user?.id,
        (update) => {
          setResearchProgress(prev => ({
            ...prev,
            progress: update.progress,
            stage: update.stage,
            message: update.message
          }));
        }
      );

      setResearchProgress({
        isLoading: false,
        progress: 100,
        stage: 'completed',
        message: 'Research complete!',
        error: null
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Research failed';
      
      setResearchProgress({
        isLoading: false,
        progress: 0,
        stage: 'failed',
        message: errorMessage,
        error: errorMessage
      });

      // Fall back to Netlify functions if backend is down
      if (!backendHealthy) {
        console.log('🔄 Falling back to Netlify functions...');
        // Call your existing baselineResearch function here
      }

      throw error;
    }
  }, [user, backendHealthy]);

  return {
    runResearch,
    researchProgress,
    backendHealthy,
    isProcessing: researchProgress.isLoading
  };
}

/**
 * Hook for batch research operations
 */
export function useBatchResearch() {
  const [batchProgress, setBatchProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    isProcessing: false
  });

  const runBatchResearch = useCallback(async (
    doctors: any[],
    product: string
  ) => {
    setBatchProgress({
      total: doctors.length,
      completed: 0,
      failed: 0,
      isProcessing: true
    });

    // Implementation here...
    
  }, []);

  return {
    runBatchResearch,
    batchProgress
  };
}