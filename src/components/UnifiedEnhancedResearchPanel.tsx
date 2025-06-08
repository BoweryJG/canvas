import React, { useState, useEffect } from 'react';
import { MagicResearchForm } from './MagicResearchForm';
import { useUnifiedResearch } from '../lib/useUnifiedResearch';
import { type Doctor } from './DoctorAutocomplete';

export const UnifiedEnhancedResearchPanel: React.FC = () => {
  const { isResearching, progress, result, error, startResearch, reset } = useUnifiedResearch();
  const [showResults, setShowResults] = useState(false);

  const handleResearchSubmit = async (formData: any) => {
    try {
      // Convert form data to Doctor type
      const doctor: Doctor = {
        npi: formData.npi || '',
        displayName: formData.doctorName,
        firstName: formData.doctorName.split(' ')[0] || '',
        lastName: formData.doctorName.split(' ').slice(1).join(' ') || formData.doctorName,
        specialty: formData.specialty || 'Dentist',
        city: formData.location.split(',')[0]?.trim() || '',
        state: formData.location.split(',')[1]?.trim() || '',
        organizationName: formData.practiceName || '',
        credential: formData.credential || '',
        fullAddress: formData.location || '',
        phone: formData.phone || ''
      };

      await startResearch(doctor, formData.productName || 'dental product');
    } catch (err) {
      console.error('Research failed:', err);
    }
  };

  useEffect(() => {
    if (result && !isResearching) {
      setShowResults(true);
    }
  }, [result, isResearching]);

  const handleNewResearch = () => {
    reset();
    setShowResults(false);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'found':
        return '🎯';
      case 'active':
        return '⏳';
      default:
        return '⭕';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent < 30) return 'bg-yellow-500';
    if (percent < 60) return 'bg-blue-500';
    if (percent < 90) return 'bg-green-500';
    return 'bg-green-600';
  };

  if (showResults && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Research Complete</h2>
              <button
                onClick={handleNewResearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Research
              </button>
            </div>

            {/* Confidence Score */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Confidence Score</span>
                <span className="text-3xl font-bold text-blue-600">
                  {result.confidenceScore}%
                </span>
              </div>
              {progress?.strategy && (
                <p className="text-sm text-gray-600 mt-2">
                  Strategy: {progress.strategy}
                </p>
              )}
            </div>

            {/* Sales Brief */}
            {(result as any).salesBrief && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Sales Brief</h3>
                <p className="text-gray-700">{(result as any).salesBrief}</p>
              </div>
            )}

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(result as any).buyingSignals && (result as any).buyingSignals.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Buying Signals</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {(result as any).buyingSignals.map((signal: string, idx: number) => (
                      <li key={idx}>{signal}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(result as any).painPoints && (result as any).painPoints.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Pain Points</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {(result as any).painPoints.map((pain: string, idx: number) => (
                      <li key={idx}>{pain}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Strategy Details */}
            {(result as any).strategyUsed && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Research Strategy Used</h4>
                <p className="text-sm text-gray-700">
                  Focus Areas: {(result as any).strategyUsed.focusAreas.join(', ')}
                </p>
                {(result as any).strategyUsed.skipReasons && (
                  <div className="mt-2 text-xs text-gray-600">
                    {Object.entries((result as any).strategyUsed.skipReasons)
                      .filter(([_, reason]) => reason)
                      .map(([area, reason]) => (
                        <div key={area}>Skipped {area}: {reason as React.ReactNode}</div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        {!isResearching && !progress && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                AI-Powered Sales Intelligence
              </h2>
              <p className="text-gray-600">
                Using Sequential Thinking for adaptive research strategy
              </p>
            </div>
            <MagicResearchForm onSubmit={handleResearchSubmit} />
          </div>
        )}
        
        {isResearching && progress && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Intelligent Research in Progress
              </h3>
              <p className="text-gray-600">
                {progress.stage}
              </p>
              {progress.strategy && (
                <p className="text-sm text-blue-600 mt-1">
                  {progress.strategy}
                </p>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {progress.percentComplete}%</span>
                <span>{progress.sourcesFound} sources found</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProgressColor(progress.percentComplete)}`}
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>
            </div>

            {/* Step Progress */}
            <div className="space-y-3">
              {progress.steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    step.status === 'active' ? 'bg-blue-50 border border-blue-200' :
                    step.status === 'completed' || step.status === 'found' ? 'bg-green-50' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getStepIcon(step.status)}</span>
                    <span className={`font-medium ${
                      step.status === 'active' ? 'text-blue-700' :
                      step.status === 'completed' || step.status === 'found' ? 'text-green-700' :
                      'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {step.result && (
                    <span className="text-sm text-gray-600">{step.result}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Live Confidence Score */}
            {progress.confidenceScore > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Current Confidence Score
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {progress.confidenceScore}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-700">Error: {error}</p>
            <button
              onClick={reset}
              className="mt-2 text-sm text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedEnhancedResearchPanel;