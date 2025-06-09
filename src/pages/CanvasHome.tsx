import { useState } from 'react'
import { getInstantResults } from '../lib/instantResults'
import { TargetSightIcon, ProductScanIcon, TacticalBriefIcon } from '../components/Icons'
// @ts-ignore
import EnhancedActionSuite from '../components/EnhancedActionSuite'
import ResearchPanel from '../components/ResearchPanel'
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience'
import { analyzeDoctor } from '../lib/intelligentAnalysis'
import { ManualDoctorForm } from '../components/ManualDoctorForm'
import DoctorVerification from '../components/DoctorVerification'
import type { Doctor } from '../components/DoctorAutocomplete'
import { IntelligenceGauge } from '../components/IntelligenceGauge'
import { unifiedCanvasResearch } from '../lib/unifiedCanvasResearch'
import type { ResearchData } from '../lib/webResearch'
import { IntelligenceProgress } from '../components/IntelligenceProgress'
import { MOCK_MODE } from '../lib/mockResearch'
import PowerPackModal from '../components/PowerPackModal'

interface ScanResult {
  doctor: string;
  product: string;
  score: number;
  doctorProfile: string;
  productIntel: string;
  salesBrief: string;
  insights: string[];
  researchQuality?: 'verified' | 'partial' | 'inferred' | 'unknown';
  researchSources?: number;
  factBased?: boolean;
  confidenceScore?: number;
}

// Helper functions for creating enhanced content
function calculateOpportunityScore(insights: any, analysis: any): number {
  if (!insights) return analysis?.interestLevel || 50;
  
  let score = 50; // Base score
  
  // Add points for buying signals
  if (insights.buyingSignals?.length > 0) score += insights.buyingSignals.length * 5;
  
  // Add points for pain points that match product
  if (insights.painPoints?.length > 0) score += insights.painPoints.length * 3;
  
  // Add points for technology gaps
  if (insights.technologyStack?.gaps?.length > 0) score += insights.technologyStack.gaps.length * 4;
  
  // Add points for budget indicators
  if (insights.budgetIndicators?.technologyBudget) score += 10;
  
  // Cap at 100
  return Math.min(score, 100);
}

function createDoctorProfile(insights: any, research: ResearchData): string {
  if (!insights) return 'Limited information available.';
  
  const profile = insights.practiceProfile || {};
  const market = insights.marketPosition || {};
  
  return `**${research.doctorName}** - ${profile.size || 'Unknown size'} practice
${profile.patientVolume ? `Patient Volume: ${profile.patientVolume}` : ''}
${profile.technologyLevel ? `Technology: ${profile.technologyLevel}` : ''}
${market.ranking ? `Market Position: ${market.ranking}` : ''}
${market.reputation ? `Reputation: ${market.reputation}` : ''}`;
}

function createProductIntel(insights: any, product: string): string {
  if (!insights) return `${product} could benefit this practice.`;
  
  const gaps = insights.technologyStack?.gaps || [];
  const painPoints = insights.painPoints || [];
  
  return `${product} directly addresses:
${gaps.length > 0 ? `• Technology gaps: ${gaps.join(', ')}` : ''}
${painPoints.length > 0 ? `• Pain points: ${painPoints.slice(0, 3).join(', ')}` : ''}
${insights.approachStrategy?.keyMessage || ''}`;
}

function createPowerfulSalesBrief(insights: any, doctor: string, product: string, researchData?: any): string {
  // First check if we have a salesBrief at the top level of research data
  if (researchData?.salesBrief) {
    return researchData.salesBrief;
  }
  
  // Then check insights
  if (insights?.salesBrief) {
    return insights.salesBrief;
  }
  
  // Fallback brief
  let brief = `**TACTICAL APPROACH for ${doctor}**\n\n`;
  brief += `Position ${product} as a modern solution for their ${insights?.specialty || 'practice'} needs. `;
  
  // Add timing and approach
  if (insights.approachStrategy) {
    brief += `\n\n**Approach**: ${insights.approachStrategy.preferredChannel || 'Direct'} contact ${insights.approachStrategy.bestTiming || 'during business hours'}.`;
  }
  
  // Add decision maker info
  if (insights.decisionMakers?.primary) {
    brief += `\n**Target**: ${insights.decisionMakers.primary}`;
  }
  
  return brief;
}

function extractKeyInsights(insights: any, research: ResearchData): string[] {
  const keyInsights: string[] = [];
  
  // Add source count
  keyInsights.push(`📊 Analyzed ${research.sources.length} sources with ${research.confidenceScore}% confidence`);
  
  if (insights) {
    // Add technology insights
    if (insights.technologyStack?.current?.length > 0) {
      keyInsights.push(`💻 Current tech: ${insights.technologyStack.current.slice(0, 3).join(', ')}`);
    }
    
    // Add buying signals
    insights.buyingSignals?.forEach((signal: string) => {
      keyInsights.push(`🎯 ${signal}`);
    });
    
    // Add competition insights
    if (insights.competition?.currentVendors?.length > 0) {
      keyInsights.push(`🏢 Working with: ${insights.competition.currentVendors.join(', ')}`);
    }
    
    // Add budget insights
    if (insights.budgetIndicators?.purchaseTimeframe) {
      keyInsights.push(`💰 Purchase timeframe: ${insights.budgetIndicators.purchaseTimeframe}`);
    }
  }
  
  return keyInsights;
}

export default function CanvasHome() {
  const [doctor, setDoctor] = useState('')
  const [product, setProduct] = useState('')
  const [, setLocation] = useState('')
  // @ts-ignore - Will use for enhanced verification
  const [practiceName, setPracticeName] = useState('')
  // @ts-ignore - Will use for NPI data
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  // @ts-ignore - Might use for future features
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanStage, setScanStage] = useState('')
  const [cinematicMode, setCinematicMode] = useState(false)
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false)
  const [showEnhancements, setShowEnhancements] = useState(false)
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [intelligenceSteps, setIntelligenceSteps] = useState<any[]>([])
  const [sourcesFound, setSourcesFound] = useState(0)
  const [confidenceScore, setConfidenceScore] = useState(50)
  const [showBatchPanel, setShowBatchPanel] = useState(false)
  const [isSelectingDoctor, setIsSelectingDoctor] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [pendingVerification, setPendingVerification] = useState<any>(null)
  const [enhancements, setEnhancements] = useState({
    website: '',
    recentPurchases: '',
    painPoints: '',
    practiceSize: '',
    notes: ''
  })

  const handleDoctorSelect = async (selectedDoc: Doctor) => {
    // Prevent duplicate selections
    if (isSelectingDoctor || selectedDoctor?.npi === selectedDoc.npi) {
      console.log('Preventing duplicate doctor selection');
      return;
    }
    
    setIsSelectingDoctor(true);
    
    // Instead of auto-proceeding, treat this like manual entry
    // Convert to the same format and trigger verification
    const doctorData = {
      doctorName: `${selectedDoc.firstName} ${selectedDoc.lastName}`,
      specialty: selectedDoc.specialty,
      location: `${selectedDoc.city}, ${selectedDoc.state}`,
      npi: selectedDoc.npi,
      practice: selectedDoc.organizationName,
      phone: selectedDoc.phone,
      address: selectedDoc.fullAddress,
      confidence: 100, // NPI verified
      fromAutocomplete: true
    };
    
    console.log('✅ NPI Doctor Selected, triggering verification:', doctorData);
    
    // Trigger the same verification flow as manual entry
    handleManualDoctorVerified(doctorData);
    
    // Reset the flag after a short delay
    setTimeout(() => setIsSelectingDoctor(false), 500);
  }

  const handleScan = async () => {
    if (!doctor || !product || !selectedDoctor) return
    
    // Skip verification - NPI is already verified!
    // Go straight to generating the brief
    const npiProfile = {
      name: selectedDoctor.displayName,
      npi: selectedDoctor.npi,
      specialty: selectedDoctor.specialty,
      location: `${selectedDoctor.city}, ${selectedDoctor.state}`,
      practice: selectedDoctor.organizationName || practiceName || 'Private Practice',
      phone: selectedDoctor.phone,
      // Add any enhancements
      website: enhancements.website,
      additionalContext: {
        recentPurchases: enhancements.recentPurchases,
        painPoints: enhancements.painPoints,
        practiceSize: enhancements.practiceSize,
        notes: enhancements.notes
      }
    };
    
    console.log('🚀 Generating intel with NPI-verified profile:', npiProfile);
    handleDoctorConfirmed(npiProfile);
  }

  // Handle manual doctor entry and verification
  const handleManualDoctorVerified = (doctorData: any) => {
    console.log('🔍 Doctor search completed, showing verification:', doctorData);
    
    // ALWAYS show verification dialog, regardless of confidence
    setPendingVerification(doctorData);
    setShowVerification(true);
  }

  // Process doctor data after verification
  const proceedWithDoctorData = (doctorData: any) => {
    setDoctor(doctorData.doctorName || doctorData.name);
    setLocation(doctorData.location);
    setPracticeName(doctorData.practice || '');
    
    // Create a pseudo-doctor object for compatibility
    const pseudoDoctor = {
      npi: doctorData.npi || '',
      displayName: doctorData.doctorName || doctorData.name,
      firstName: doctorData.doctorName?.split(' ')[0] || '',
      lastName: doctorData.doctorName?.split(' ').slice(-1)[0] || '',
      specialty: doctorData.specialty,
      city: doctorData.location?.split(',')[0]?.trim() || '',
      state: doctorData.location?.split(',')[1]?.trim() || '',
      organizationName: doctorData.practice,
      phone: doctorData.phone || '',
      fullAddress: doctorData.address || '',
      credential: ''
    };
    
    setSelectedDoctor(pseudoDoctor as Doctor);
    setShowEnhancements(true);
    
    // If we have a verified website, add it to enhancements
    if (doctorData.website) {
      setEnhancements(prev => ({ ...prev, website: doctorData.website }));
    }
  }

  const handleDoctorConfirmed = async (profile: any) => {
    setIsGeneratingBrief(true)
    setScanStage('Gathering comprehensive doctor information...')
    
    try {
      // Initialize progress tracking with clear explanations
      setIntelligenceSteps([
        { id: 'practice', label: '🔍 Finding Their Practice Website', sublabel: 'Searching for official site, not directories', status: 'pending' },
        { id: 'reviews', label: '⭐ What Patients Say', sublabel: 'Checking Google, Healthgrades, Yelp reviews', status: 'pending' },
        { id: 'professional', label: '🎓 Verifying Credentials', sublabel: 'Board certifications, NPI validation', status: 'pending' },
        { id: 'website', label: '🌐 Analyzing Their Tech Stack', sublabel: 'Scanning for CBCT, software, digital tools', status: 'pending' },
        { id: 'competition', label: '🏢 Current Vendor Analysis', sublabel: 'Who they buy from now', status: 'pending' },
        { id: 'technology', label: `🎯 ${product} Fit Assessment`, sublabel: 'Finding integration opportunities', status: 'pending' },
        { id: 'synthesis', label: '🧠 Creating Your Sales Arsenal', sublabel: 'Custom brief, talking points, objection handlers', status: 'pending' }
      ]);
      
      // Progress callbacks
      const progressCallbacks = {
        updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => {
          setIntelligenceSteps(prev => prev.map(step => 
            step.id === stepId ? { ...step, status, result } : step
          ));
        },
        updateSources: (count: number) => setSourcesFound(count),
        updateConfidence: (score: number) => setConfidenceScore(score),
        updateStage: (stage: string) => setScanStage(stage)
      };
      
      // Step 1: Gather comprehensive intelligence using multiple sources
      // Include any website we found from NPI research
      const doctorWithWebsite = {
        ...selectedDoctor!,
        practiceWebsite: enhancements.website || undefined
      };
      
      const result = await unifiedCanvasResearch(
        doctorWithWebsite, 
        product,
        {
          mode: 'adaptive', // Use Sequential Thinking!
          existingWebsite: enhancements.website,
          progress: progressCallbacks
        }
      );
      
      const comprehensiveResearch = result.adaptive || result.legacy || result.deep;
      setResearchData(comprehensiveResearch);
      
      // Step 2: Extract insights from the enhanced research
      const insights = comprehensiveResearch.enhancedInsights;
      
      // Step 3: Sales brief is available in insights
      
      // Step 4: Basic analysis for compatibility score
      setScanStage('Finalizing intelligence report...')
      const analysis = await analyzeDoctor(profile.name, profile.location, product)
      
      // Create enhanced scan result with deep insights from Claude 4
      const score = calculateOpportunityScore(insights, analysis);
      const enhancedResult: ScanResult = {
        doctor: profile.name,
        product: product,
        score: score,
        doctorProfile: createDoctorProfile(insights, comprehensiveResearch),
        productIntel: createProductIntel(insights, product),
        salesBrief: comprehensiveResearch.salesBrief || createPowerfulSalesBrief(insights, doctor, product, comprehensiveResearch),
        insights: extractKeyInsights(insights, comprehensiveResearch),
        researchQuality: 'verified' as const,
        researchSources: comprehensiveResearch.sources.length,
        factBased: true,
        // Pass confidence score to match target alignment
        confidenceScore: comprehensiveResearch.confidenceScore || score
      }
      
      setScanResult(enhancedResult)
    } catch (error) {
      console.error('Error in doctor research:', error)
      // Fallback to instant results if analysis fails
      const fallbackResult = getInstantResults(doctor, product)
      setScanResult(fallbackResult)
      // Don't trigger another research call - just use mock data
    } finally {
      setIsGeneratingBrief(false)
      setScanStage('')
    }
  }


  if (cinematicMode) {
    return (
      <>
        <button
          onClick={() => setCinematicMode(false)}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(0, 255, 198, 0.3)'
          }}
        >
          🔧 CLASSIC MODE
        </button>
        <IntegratedCanvasExperience />
      </>
    )
  }

  return (
    <div className="canvas-app">
      {/* Header */}
      <header className="header">
        <div className="header-icon">
          <TargetSightIcon className="w-12 h-12 text-electric-blue" />
        </div>
        <h1><span className="glow">CANVAS</span></h1>
        <p>INSTANT AI-POWERED SALES INTELLIGENCE</p>
        
        {/* Mock Mode Indicator */}
        {MOCK_MODE && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(255, 193, 7, 0.2)',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '5px 15px',
            fontSize: '0.85rem',
            color: '#ffc107',
            fontWeight: '600'
          }}>
            🧪 MOCK MODE
          </div>
        )}
        
        {/* Discreet Cinematic Mode Toggle */}
        <button
          onClick={() => setCinematicMode(true)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            padding: '4px 8px',
            background: 'rgba(123, 66, 246, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(123, 66, 246, 0.2)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 400,
            fontSize: '0.7rem',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(123, 66, 246, 0.2)'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7'
            e.currentTarget.style.background = 'rgba(123, 66, 246, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="Try Cinematic Mode"
        >
          🎬
        </button>
      </header>

      {/* Doctor Verification Dialog */}
      {showVerification && pendingVerification && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <DoctorVerification
            doctorName={pendingVerification.doctorName || pendingVerification.name}
            location={pendingVerification.location}
            specialty={pendingVerification.specialty}
            npi={pendingVerification.npi}
            website={pendingVerification.website}
            practice={pendingVerification.practice}
            confidence={pendingVerification.confidence}
            onConfirm={(verifiedProfile) => {
              setShowVerification(false);
              proceedWithDoctorData({
                ...pendingVerification,
                ...verifiedProfile
              });
            }}
            onReject={() => {
              setShowVerification(false);
              setPendingVerification(null);
              // Clear any selected doctor
              setSelectedDoctor(null);
              setDoctor('');
              setLocation('');
            }}
          />
        </div>
      )}

      {/* Scan Form */}
      <div className="scan-form">
        {/* Manual Doctor Entry with Optional Autocomplete */}
        <div style={{ marginBottom: '2rem' }}>
          <ManualDoctorForm 
            onDoctorVerified={handleManualDoctorVerified}
            onAutocompleteSelect={handleDoctorSelect}
          />
        </div>
        
        {/* Product and Additional Fields */}
        <div className="input-group" style={{ marginTop: '1rem' }}>
          <div className="input-with-icon">
            <ProductScanIcon className="input-icon" />
            <input
              type="text"
              placeholder="Product Name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              disabled={isScanning || isGeneratingBrief}
            />
          </div>
        </div>
        
        {/* Instant Knowledge Display - Shows after NPI selection */}
        {selectedDoctor && showEnhancements && (
          <div className="npi-verified-display">
            <div className="verified-header">
              <div className="verified-badge">
                <span className="checkmark">✓</span>
                <span>NPI VERIFIED</span>
              </div>
              <div className="npi-number">NPI: {selectedDoctor.npi}</div>
            </div>
            
            <div className="doctor-insights">
              <h3>{selectedDoctor.displayName}</h3>
              <div className="insight-grid">
                <div className="insight-item">
                  <span className="label">SPECIALTY</span>
                  <span className="value">{selectedDoctor.specialty}</span>
                </div>
                {selectedDoctor.organizationName && (
                  <div className="insight-item">
                    <span className="label">PRACTICE</span>
                    <span className="value">{selectedDoctor.organizationName}</span>
                  </div>
                )}
                <div className="insight-item">
                  <span className="label">LOCATION</span>
                  <span className="value">{selectedDoctor.city}, {selectedDoctor.state}</span>
                </div>
              </div>
              
              {/* Intelligent insights based on specialty */}
              <div className="specialty-insights">
                {selectedDoctor.specialty.toLowerCase().includes('oral') && (
                  <p className="insight-text">
                    💡 Oral surgeons typically focus on implants, wisdom teeth, and reconstructive procedures. 
                    High-value practice with surgical suite requirements.
                  </p>
                )}
                {selectedDoctor.city === 'WILLIAMSVILLE' && (
                  <p className="insight-text">
                    📍 Williamsville is an affluent Buffalo suburb. Practices here often cater to 
                    higher-income patients seeking premium services.
                  </p>
                )}
              </div>
            </div>
            
            {/* Optional Enhancements */}
            <div className="enhancement-section">
              <p className="enhancement-prompt">
                <span className="glow">ENHANCE YOUR INTEL</span> - Add any insider knowledge:
              </p>
              <div className="enhancement-fields">
                <input
                  type="text"
                  placeholder="Practice website (if known)"
                  value={enhancements.website}
                  onChange={(e) => setEnhancements({...enhancements, website: e.target.value})}
                  className="enhancement-input"
                />
                <input
                  type="text"
                  placeholder="Recent purchases or interests"
                  value={enhancements.recentPurchases}
                  onChange={(e) => setEnhancements({...enhancements, recentPurchases: e.target.value})}
                  className="enhancement-input"
                />
                <input
                  type="text"
                  placeholder="Known pain points or needs"
                  value={enhancements.painPoints}
                  onChange={(e) => setEnhancements({...enhancements, painPoints: e.target.value})}
                  className="enhancement-input"
                />
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleScan}
          disabled={!doctor || !product || !selectedDoctor || isScanning || isGeneratingBrief}
          className={`scan-btn ${(isScanning || isGeneratingBrief) ? 'scanning' : ''} ${selectedDoctor ? 'ready' : ''}`}
        >
          {selectedDoctor ? (
            isGeneratingBrief ? 'ANALYZING...' : isScanning ? 'SCANNING...' : '🎯 GENERATE INTEL'
          ) : (
            'SELECT DOCTOR FIRST'
          )}
        </button>
      </div>

      {/* Intelligence Gauge 2.0 */}
      <IntelligenceGauge
        score={scanResult?.score || 0}
        isScanning={isScanning || isGeneratingBrief}
        scanStage={scanStage}
        onComplete={() => {
          // Animation complete callback
          console.log('🎯 Intelligence scan complete');
        }}
      />

      {/* Intelligence Progress Display */}
      {isGeneratingBrief && intelligenceSteps.length > 0 && (
        <IntelligenceProgress
          steps={intelligenceSteps}
          currentStage={scanStage}
          sourcesFound={sourcesFound}
          confidenceScore={confidenceScore}
        />
      )}
      
      {/* Legacy Status (hidden when progress is shown) */}
      {(isScanning || (isGeneratingBrief && intelligenceSteps.length === 0)) && (
        <div className="status">
          <p className="scanning-text">{scanStage}</p>
        </div>
      )}

      {/* Doctor Verification - Removed: NPI selection IS the verification! */}

      {/* Research Panel */}
      {scanResult && researchData && !isGeneratingBrief && (
        <ResearchPanel 
          researchData={researchData}
          isResearching={false}
          researchQuality={scanResult.researchQuality || 'verified'}
        />
      )}

      {/* Insights */}
      {scanResult && !isGeneratingBrief && (
        <div className="insights-section">
          <div className="insights-grid">
            {scanResult.insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <p>{insight}</p>
              </div>
            ))}
          </div>
          
          {/* Sales Brief */}
          <div className="sales-brief">
            <h3>
              <TacticalBriefIcon className="inline w-5 h-5 mr-2" />
              TACTICAL SALES BRIEF
            </h3>
            <p>{scanResult.salesBrief}</p>
          </div>

          {/* Action Suite */}
          <EnhancedActionSuite 
            scanResult={scanResult as any} 
            researchData={researchData || undefined}
          />
        </div>
      )}

      {/* Scale CTA Button - Shows after successful scan */}
      {scanResult && !isGeneratingBrief && !showBatchPanel && (
        <button 
          className="scale-cta-button"
          onClick={() => setShowBatchPanel(true)}
        >
          <span className="icon">🚀</span>
          <span>Scale This x10-2500</span>
        </button>
      )}

      {/* Power Pack Modal */}
      <PowerPackModal
        isOpen={showBatchPanel}
        onClose={() => setShowBatchPanel(false)}
        onSelectPack={(pack) => {
          console.log('Selected power pack:', pack);
          // TODO: Handle pack selection - redirect to batch panel or checkout
          setShowBatchPanel(false);
        }}
        currentProduct={product}
      />
    </div>
  )
}