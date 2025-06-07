import React, { useState } from 'react';
import { MagicResearchForm } from './MagicResearchForm';
import { useRenderBackend } from '../lib/useRenderBackend';
import { AlertCircle, CheckCircle, Loader, TrendingUp, Globe, Users, Brain } from 'lucide-react';

interface StageInfo {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const STAGE_INFO: Record<string, StageInfo> = {
  website: { icon: <Globe className="w-5 h-5" />, label: 'Finding Practice Website', color: 'text-blue-600' },
  reviews: { icon: <TrendingUp className="w-5 h-5" />, label: 'Gathering Reviews', color: 'text-purple-600' },
  competition: { icon: <Users className="w-5 h-5" />, label: 'Analyzing Competition', color: 'text-orange-600' },
  synthesis: { icon: <Brain className="w-5 h-5" />, label: 'Creating Intelligence', color: 'text-green-600' }
};

export const EnhancedResearchPanelWithRender: React.FC = () => {
  const { runResearch, researchProgress, backendHealthy } = useRenderBackend();
  const [researchResult, setResearchResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleResearchSubmit = async (formData: any) => {
    setResearchResult(null);
    setShowResults(false);
    
    try {
      // Create doctor object from form data
      const doctor = {
        displayName: formData.doctorName,
        npi: formData.npi,
        specialty: formData.specialty || 'Dentistry',
        city: formData.location?.split(',')[0]?.trim() || '',
        state: formData.location?.split(',')[1]?.trim() || '',
        organizationName: formData.practiceName,
        fullAddress: formData.location,
        phone: ''
      };

      const result = await runResearch(doctor, formData.productName || 'yomi');
      
      setResearchResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Research failed:', error);
    }
  };

  const getStageStatus = (stage: string) => {
    if (!researchProgress.isLoading) return 'idle';
    if (researchProgress.stage === stage) return 'active';
    if (researchProgress.progress > getStageProgress(stage)) return 'completed';
    return 'pending';
  };

  const getStageProgress = (stage: string) => {
    switch (stage) {
      case 'website': return 25;
      case 'reviews': return 50;
      case 'competition': return 75;
      case 'synthesis': return 90;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Backend Status */}
        <div className="mb-6 flex items-center justify-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            backendHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {backendHealthy ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Enhanced Backend Online
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Using Fallback Mode
              </>
            )}
          </div>
        </div>

        {/* Research Form */}
        {!researchProgress.isLoading && !showResults && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI-Powered Sales Intelligence
              </h1>
              <p className="text-gray-600">
                Enter doctor information to generate comprehensive sales insights
              </p>
            </div>
            <MagicResearchForm onSubmit={handleResearchSubmit} />
          </div>
        )}

        {/* Progress View */}
        {researchProgress.isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Conducting Deep Research
              </h2>
              <p className="text-gray-600">
                {researchProgress.message || 'Analyzing multiple data sources...'}
              </p>
            </div>

            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span className="font-semibold">{researchProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${researchProgress.progress}%` }}
                />
              </div>
            </div>

            {/* Stage Progress */}
            <div className="space-y-4">
              {Object.entries(STAGE_INFO).map(([stage, info]) => {
                const status = getStageStatus(stage);
                return (
                  <div key={stage} className={`
                    p-4 rounded-lg border-2 transition-all duration-300
                    ${status === 'active' ? 'border-blue-500 bg-blue-50' : 
                      status === 'completed' ? 'border-green-500 bg-green-50' : 
                      'border-gray-200 bg-gray-50'}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          ${status === 'active' ? info.color : 
                            status === 'completed' ? 'text-green-600' : 'text-gray-400'}
                        `}>
                          {info.icon}
                        </div>
                        <span className={`font-medium ${
                          status === 'active' ? 'text-gray-900' : 
                          status === 'completed' ? 'text-green-900' : 'text-gray-500'
                        }`}>
                          {info.label}
                        </span>
                      </div>
                      <div>
                        {status === 'active' && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
                        {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results View */}
        {showResults && researchResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Research Complete
                </h2>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setResearchResult(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  New Research
                </button>
              </div>

              {/* Confidence Score */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confidence Score</h3>
                    <p className="text-gray-600">Based on {researchResult.sources?.length || 0} verified sources</p>
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {researchResult.confidence?.score || 0}%
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              {researchResult.synthesis && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                    <p className="text-gray-700">{researchResult.synthesis.executiveSummary}</p>
                  </div>

                  {/* Buying Signals */}
                  {researchResult.synthesis.buyingSignals?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">🎯 Buying Signals</h3>
                      <div className="space-y-3">
                        {researchResult.synthesis.buyingSignals.map((signal: any, idx: number) => (
                          <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-green-900">{signal.signal}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                signal.urgency === 'high' ? 'bg-red-100 text-red-700' :
                                signal.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {signal.urgency} urgency
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{signal.evidence}</p>
                            <p className="text-sm text-blue-600 mt-2">{signal.relevanceToProduct}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approach Strategy */}
                  {researchResult.synthesis.approachStrategy && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">📋 Recommended Approach</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Best Channel</p>
                          <p className="text-gray-900">{researchResult.synthesis.approachStrategy.bestChannel?.primary}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Opening Message</p>
                          <p className="text-gray-900 italic">"{researchResult.synthesis.approachStrategy.messaging?.opener}"</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Key Value Props</p>
                          <ul className="list-disc list-inside text-gray-900">
                            {researchResult.synthesis.approachStrategy.valueProps?.map((prop: string, idx: number) => (
                              <li key={idx}>{prop}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  {researchResult.synthesis.actionPlan && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">🚀 Action Plan</h3>
                      <div className="space-y-3">
                        {researchResult.synthesis.actionPlan.map((step: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{step.action}</p>
                              <p className="text-sm text-gray-600">{step.timing}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};