import { useState, useEffect } from 'react';
import { ProgressiveResearchEngine, type ResearchProgress } from '../lib/progressiveResearch';
import { Brain, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ProgressiveResearchPanelProps {
  doctorName: string;
  productName: string;
  location?: string;
  onComplete?: (data: any) => void;
}

export function ProgressiveResearchPanel({
  doctorName,
  productName,
  location,
  onComplete
}: ProgressiveResearchPanelProps) {
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [engine] = useState(() => new ProgressiveResearchEngine());
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up event listeners
    engine.on('progress', (progress: ResearchProgress) => {
      setProgress(progress);
    });

    engine.on('complete', (data: any) => {
      setIsComplete(true);
      onComplete?.(data);
    });

    engine.on('error', (err: Error) => {
      setError(err.message);
    });

    // Start research
    engine.startResearch(doctorName, productName, location, 'deep');

    // Cleanup
    return () => {
      engine.cancel();
      engine.removeAllListeners();
    };
  }, [doctorName, productName, location]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${seconds}s`;
  };

  const getStageInfo = (stage: string) => {
    const stages = {
      instant: { label: 'Instant Intel', color: 'text-blue-500' },
      basic: { label: 'Basic Research', color: 'text-green-500' },
      enhanced: { label: 'Enhanced Analysis', color: 'text-purple-500' },
      deep: { label: 'Deep Intelligence', color: 'text-orange-500' },
      complete: { label: 'Complete', color: 'text-gray-500' }
    };
    return stages[stage as keyof typeof stages] || stages.instant;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>Research failed: {error}</span>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const stageInfo = getStageInfo(progress.stage);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Progressive Research Engine</h3>
              <p className="text-sm opacity-90">
                Gathering intelligence on Dr. {doctorName}
              </p>
            </div>
          </div>
          {!isComplete && (
            <button
              onClick={() => engine.cancel()}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>

      {/* Status */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${stageInfo.color}`}>
              {stageInfo.label}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-600">
              {progress.currentAction}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {progress.percentComplete}%
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Elapsed: {formatTime(progress.timeElapsed)}</span>
            </div>
            {progress.estimatedTimeRemaining > 0 && (
              <div>
                Remaining: ~{formatTime(progress.estimatedTimeRemaining)}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Results */}
        {progress.data && (
          <div className="space-y-3 pt-2 border-t">
            {/* Score */}
            {progress.data.score > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fit Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress.data.score >= 80 ? 'bg-green-500' :
                        progress.data.score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${progress.data.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {progress.data.score}%
                  </span>
                </div>
              </div>
            )}

            {/* Insights */}
            {progress.data.insights?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Live Insights</h4>
                <ul className="space-y-1">
                  {progress.data.insights.slice(-3).map((insight: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources Found */}
            {progress.data.sources?.length > 0 && (
              <div className="text-sm text-gray-600">
                Sources analyzed: {progress.data.sources.length}
              </div>
            )}
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Research Complete!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Full intelligence report is ready. Total time: {formatTime(progress.timeElapsed)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}