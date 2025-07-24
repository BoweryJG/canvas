import React, { useState } from 'react';
import { MagicResearchForm } from './MagicResearchForm';
import { ProgressiveResearchEngine } from '../lib/progressiveResearch';
import { conductEnhancedResearch } from '../lib/enhancedWebResearch';
import { useAuth } from '../auth';

interface ResearchData {
  insights?: string[];
  score?: number;
  sources?: unknown[];
  [key: string]: unknown;
}

interface ResearchProgress {
  stage: 'idle' | 'instant' | 'basic' | 'enhanced' | 'deep' | 'complete';
  percentComplete: number;
  currentAction: string;
  data: ResearchData;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

export const EnhancedResearchPanel: React.FC = () => {
  const { user } = useAuth();
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress | null>(null);
  const [researchEngine] = useState(() => new ProgressiveResearchEngine());
  
  const handleResearchSubmit = async (formData: Record<string, unknown>) => {
    setIsResearching(true);
    
    // If we have NPI data, do enhanced research first
    if (formData.npi && formData.specialty) {
      console.log('🎯 Using NPI-enhanced research for higher accuracy!');
      
      // Quick enhanced search with specialty data
      const enhancedResults = await conductEnhancedResearch({
        doctorName: formData.doctorName as string,
        specialty: formData.specialty as string,
        location: formData.location as string | undefined,
        credential: formData.credential as string | undefined,
        npi: formData.npi as string | undefined,
        practiceName: formData.practiceName as string | undefined
      }, user?.id);
      
      console.log(`✨ Enhanced search confidence: ${enhancedResults.confidence}%`);
    }
    
    // Set up progress listeners
    const handleProgress = (progress: ResearchProgress) => {
      setResearchProgress(progress);
    };
    
    const handleComplete = (finalData: ResearchData) => {
      setIsResearching(false);
      console.log('Research complete!', finalData);
    };
    
    const handleError = (error: Error) => {
      setIsResearching(false);
      console.error('Research failed:', error);
    };
    
    researchEngine.on('progress', handleProgress);
    researchEngine.on('complete', handleComplete);
    researchEngine.on('error', handleError);
    
    // Start the progressive research
    researchEngine.startResearch(
      formData.doctorName as string,
      formData.productName as string,
      formData.location as string | undefined,
      'standard',
      user?.id
    );
    
    // Cleanup listeners when component unmounts or research changes
    return () => {
      researchEngine.off('progress', handleProgress);
      researchEngine.off('complete', handleComplete);
      researchEngine.off('error', handleError);
    };
  };
  
  const getProgressColor = (percent: number) => {
    if (percent < 30) return 'bg-yellow-500';
    if (percent < 60) return 'bg-blue-500';
    if (percent < 90) return 'bg-green-500';
    return 'bg-green-600';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        {!isResearching && !researchProgress && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <MagicResearchForm onSubmit={handleResearchSubmit} />
          </div>
        )}
        
        {isResearching && researchProgress && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Intelligent Research in Progress
              </h3>
              <p className="text-gray-600">
                {researchProgress.currentAction}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {researchProgress.percentComplete}%</span>
                <span>Stage: {researchProgress.stage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProgressColor(researchProgress.percentComplete)}`}
                  style={{ width: `${researchProgress.percentComplete}%` }}
                />
              </div>
            </div>
            
            {/* Time Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-gray-600">Time Elapsed</div>
                <div className="font-semibold">
                  {Math.floor(researchProgress.timeElapsed / 1000)}s
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-gray-600">Est. Remaining</div>
                <div className="font-semibold">
                  {Math.floor(researchProgress.estimatedTimeRemaining / 1000)}s
                </div>
              </div>
            </div>
            
            {/* Research Insights */}
            {researchProgress.data?.insights && Array.isArray(researchProgress.data.insights) && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Live Intelligence Feed
                </h4>
                <div className="space-y-2">
                  {researchProgress.data.insights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 text-sm animate-fade-in"
                    >
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Confidence Score */}
            {researchProgress.data?.score && (
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-600 mb-1">Match Confidence</div>
                <div className="text-3xl font-bold text-blue-600">
                  {researchProgress.data.score}%
                </div>
              </div>
            )}
            
            <button
              onClick={() => researchEngine.cancel()}
              className="mt-6 w-full py-2 px-4 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              Cancel Research
            </button>
          </div>
        )}
        
        {!isResearching && researchProgress?.stage === 'complete' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900">
                Research Complete!
              </h3>
              <p className="text-gray-600 mt-2">
                Full intelligence report ready
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {researchProgress.data?.score || 0}%
                </div>
                <div className="text-sm text-gray-600">Match Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {researchProgress.data?.sources?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Sources Found</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.floor((researchProgress.timeElapsed || 0) / 1000)}s
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setResearchProgress(null);
                setIsResearching(false);
              }}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Research
            </button>
          </div>
        )}
      </div>
    </div>
  );
};