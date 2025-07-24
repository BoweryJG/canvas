import { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Lock, 
  Unlock,
  ChevronRight,
  Download,
  Send,
  Clock
} from 'lucide-react';
import { generateProgressiveOutreach, getOutreachCapabilities, OUTREACH_TIERS } from '../lib/progressiveOutreach';

interface ResearchData {
  businessName?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  businessIntel?: {
    industry?: string;
    size?: string;
    location?: string;
  };
  technology?: Record<string, unknown>;
  competitors?: unknown[];
  painPoints?: string[];
}

interface FollowUpMessage {
  day: number;
  subject: string;
  content?: string;
}

interface OutreachMaterial {
  subject: string;
  emailContent: string;
  personalizations?: string[];
  followUpSequence?: FollowUpMessage[];
  confidence: number;
}

interface OutreachPanelProps {
  researchData: ResearchData;
  researchProgress: number;
  onGenerateOutreach?: (tier: string, material: OutreachMaterial) => void;
}

export function ProgressiveOutreachPanel({ 
  researchData, 
  researchProgress,
  onGenerateOutreach 
}: OutreachPanelProps) {
  const [selectedTier, setSelectedTier] = useState<'generic' | 'pro' | 'genius'>('generic');
  const [generatedMaterial, setGeneratedMaterial] = useState<OutreachMaterial | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [capabilities] = useState(() => getOutreachCapabilities(researchProgress));

  // Update capabilities when research progresses
  useEffect(() => {
    const newCapabilities = getOutreachCapabilities(researchProgress);
    // Trigger re-render when capabilities change
    if (newCapabilities.pro.available && !capabilities.pro.available) {
      console.log('Pro outreach unlocked!');
    }
    if (newCapabilities.genius.available && !capabilities.genius.available) {
      console.log('Genius outreach unlocked!');
    }
  }, [researchProgress]);

  const handleGenerateOutreach = async (tier: 'generic' | 'pro' | 'genius') => {
    setIsGenerating(true);
    setSelectedTier(tier);
    
    try {
      const material = await generateProgressiveOutreach(
        researchData,
        researchProgress,
        tier
      );
      
      setGeneratedMaterial(material);
      onGenerateOutreach?.(tier, material);
    } catch (error) {
      console.error('Failed to generate outreach:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tierCards = [
    {
      id: 'generic',
      tier: OUTREACH_TIERS.generic,
      icon: Mail,
      color: 'blue',
      available: researchProgress >= 10
    },
    {
      id: 'pro',
      tier: OUTREACH_TIERS.pro,
      icon: MessageSquare,
      color: 'purple',
      available: researchProgress >= 35
    },
    {
      id: 'genius',
      tier: OUTREACH_TIERS.genius,
      icon: Sparkles,
      color: 'orange',
      available: researchProgress >= 65
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Sales Outreach Materials</h3>
        <p className="text-sm text-gray-600 mt-1">
          Outreach quality improves as research progresses
        </p>
      </div>

      {/* Tier Selection */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {tierCards.map((card) => {
          const isAvailable = card.available;
          const isSelected = selectedTier === card.id;
          
          return (
            <div
              key={card.id}
              onClick={() => isAvailable && handleGenerateOutreach(card.id as 'generic' | 'pro' | 'genius')}
              className={`
                relative rounded-lg border-2 p-4 cursor-pointer transition-all
                ${isAvailable 
                  ? isSelected 
                    ? `border-${card.color}-500 bg-${card.color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-75'
                }
              `}
            >
              {/* Lock indicator */}
              <div className="absolute top-2 right-2">
                {isAvailable ? (
                  <Unlock className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex items-center space-x-3 mb-3">
                <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                <h4 className="font-semibold text-gray-900">{card.tier.name}</h4>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {card.tier.description}
              </p>

              {/* Features */}
              <ul className="space-y-1 text-xs">
                {card.tier.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <ChevronRight className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Availability */}
              <div className="mt-3 pt-3 border-t">
                {isAvailable ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-600">Available Now</span>
                    <span className="text-xs text-gray-500">
                      {card.tier.apiCalls === 0 ? 'Instant' : `${card.tier.apiCalls} API call${card.tier.apiCalls > 1 ? 's' : ''}`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Unlocks at {card.tier.availableAt}% complete</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generated Material Preview */}
      {generatedMaterial && (
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-4">
            {/* Email Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Email Template</h4>
                <div className="flex items-center space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button className="text-sm text-green-600 hover:text-green-700 flex items-center space-x-1">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-500">Subject:</span>
                  <p className="text-sm text-gray-900">{generatedMaterial.subject}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Preview:</span>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {generatedMaterial.emailContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Personalizations */}
            {generatedMaterial.personalizations?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Personalizations ({generatedMaterial.personalizations.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {generatedMaterial.personalizations.map((item: string, i: number) => (
                    <span 
                      key={i}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Sequence */}
            {generatedMaterial.followUpSequence?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Follow-up Sequence
                </h5>
                <div className="space-y-2">
                  {generatedMaterial.followUpSequence.map((followUp: FollowUpMessage, i: number) => (
                    <div key={i} className="flex items-center space-x-3 text-sm">
                      <span className="text-gray-500">Day {followUp.day}:</span>
                      <span className="text-gray-700">{followUp.subject}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Score */}
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-medium text-gray-700">
                Outreach Confidence
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      generatedMaterial.confidence >= 80 ? 'bg-green-500' :
                      generatedMaterial.confidence >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${generatedMaterial.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {generatedMaterial.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            <span>Generating {selectedTier} outreach materials...</span>
          </div>
        </div>
      )}
    </div>
  );
}