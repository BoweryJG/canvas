import { useState } from 'react'
import { getInstantResults } from '../lib/instantResults'
import { TargetSightIcon, DoctorTargetIcon, ProductScanIcon, TacticalBriefIcon, LocationTargetIcon } from '../components/Icons'
// @ts-ignore
import EnhancedActionSuite from '../components/EnhancedActionSuite'
import ResearchPanel from '../components/ResearchPanel'
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience'
import { analyzeDoctor } from '../lib/intelligentAnalysis'
import { generateEnhancedSalesBrief } from '../lib/enhancedResearch'
import { DoctorAutocomplete } from '../components/DoctorAutocomplete'
import type { Doctor } from '../components/DoctorAutocomplete'
import { gatherComprehensiveDoctorIntelligenceWithProgress } from '../lib/enhancedDoctorIntelligenceWithProgress'
import type { ResearchData } from '../lib/webResearch'
import { IntelligenceProgress } from '../components/IntelligenceProgress'

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

function createPowerfulSalesBrief(insights: any, doctor: string, product: string): string {
  if (!insights?.salesBrief) {
    return `Contact ${doctor} about ${product} benefits.`;
  }
  
  // If we have a brief from Claude 4, enhance it with specific details
  let brief = insights.salesBrief;
  
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
  const [location, setLocation] = useState('')
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
  const [enhancements, setEnhancements] = useState({
    website: '',
    recentPurchases: '',
    painPoints: '',
    practiceSize: '',
    notes: ''
  })

  const handleDoctorSelect = async (selectedDoc: Doctor) => {
    setSelectedDoctor(selectedDoc)
    setDoctor(selectedDoc.displayName)
    setLocation(`${selectedDoc.city}, ${selectedDoc.state}`)
    if (selectedDoc.organizationName) {
      setPracticeName(selectedDoc.organizationName)
    }
    
    // Show immediate "we know this doctor" feedback
    setShowEnhancements(true)
    
    // Log NPI data for verification
    console.log('✅ NPI Verified Doctor Selected:', {
      npi: selectedDoc.npi,
      name: selectedDoc.displayName,
      specialty: selectedDoc.specialty,
      location: `${selectedDoc.city}, ${selectedDoc.state}`,
      organization: selectedDoc.organizationName || 'Private Practice'
    });
    
    // Start background research to find website
    setTimeout(async () => {
      try {
        const quickResearch = await conductNPIEnhancedResearch(selectedDoc, 'general');
        if (quickResearch.practiceInfo?.website) {
          setEnhancements(prev => ({ ...prev, website: quickResearch.practiceInfo.website || '' }));
          console.log('Found website in background:', quickResearch.practiceInfo.website);
        }
      } catch (error) {
        console.log('Could not fetch website in background:', error);
      }
    }, 100);
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

  const handleDoctorConfirmed = async (profile: any) => {
    setIsGeneratingBrief(true)
    setScanStage('Gathering comprehensive doctor information...')
    
    try {
      // Initialize progress tracking
      setIntelligenceSteps([
        { id: 'practice', label: 'Searching Practice Information', sublabel: 'Website, contact details, services', status: 'pending' },
        { id: 'reviews', label: 'Gathering Patient Reviews', sublabel: 'Ratings, feedback, reputation', status: 'pending' },
        { id: 'professional', label: 'Professional Activities', sublabel: 'Conferences, publications, achievements', status: 'pending' },
        { id: 'website', label: 'Deep Website Analysis', sublabel: 'Using Firecrawl for rich data', status: 'pending' },
        { id: 'competition', label: 'Market Competition Analysis', sublabel: 'Local competitors, market position', status: 'pending' },
        { id: 'technology', label: 'Technology Research', sublabel: `${product} adoption and readiness`, status: 'pending' },
        { id: 'synthesis', label: 'Claude 4 Opus Synthesis', sublabel: 'Creating personalized intelligence', status: 'pending' }
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
      const comprehensiveResearch = await gatherComprehensiveDoctorIntelligenceWithProgress(
        selectedDoctor!, 
        product,
        progressCallbacks
      );
      setResearchData(comprehensiveResearch);
      
      // Step 2: Extract insights from the enhanced research
      const insights = comprehensiveResearch.enhancedInsights;
      
      // Step 3: Sales brief is available in insights
      
      // Step 4: Basic analysis for compatibility score
      setScanStage('Finalizing intelligence report...')
      const analysis = await analyzeDoctor(profile.name, profile.location, product)
      
      // Create enhanced scan result with deep insights from Claude 4
      const enhancedResult: ScanResult = {
        doctor: profile.name,
        product: product,
        score: calculateOpportunityScore(insights, analysis),
        doctorProfile: createDoctorProfile(insights, comprehensiveResearch),
        productIntel: createProductIntel(insights, product),
        salesBrief: createPowerfulSalesBrief(insights, doctor, product),
        insights: extractKeyInsights(insights, comprehensiveResearch),
        researchQuality: 'verified' as const,
        researchSources: comprehensiveResearch.sources.length,
        factBased: true
      }
      
      setScanResult(enhancedResult)
    } catch (error) {
      console.error('Error in doctor research:', error)
      // Fallback to instant results if analysis fails
      const fallbackResult = getInstantResults(doctor, product)
      setScanResult(fallbackResult)
      // Still set basic research data
      if (selectedDoctor) {
        const basicResearch = await conductNPIEnhancedResearch(selectedDoctor, product)
        setResearchData(basicResearch)
      }
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

      {/* Scan Form */}
      <div className="scan-form">
        <div className="input-group">
          <div className="input-with-icon">
            <DoctorTargetIcon className="input-icon" />
            <DoctorAutocomplete 
              onSelect={handleDoctorSelect}
              placeholder="Doctor Name"
              inputClassName="canvas-input"
              dropdownClassName="canvas-dropdown"
            />
          </div>
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
          <div className="input-with-icon">
            <LocationTargetIcon className="input-icon" />
            <input
              type="text"
              placeholder="Location (City, State)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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

      {/* Gauge */}
      <div className="gauge-container">
        <div className={`gauge ${isScanning ? 'spinning' : ''} ${(scanResult?.score || 0) >= 80 ? 'high-value' : ''}`}>
          <div className="gauge-frame">
            <div 
              className="gauge-needle" 
              style={{ 
                transform: `translate(-50%, -100%) rotate(${-135 + ((scanResult?.score || 0) / 100) * 270}deg)`,
                transition: isScanning ? 'none' : 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            <div className="gauge-center" />
          </div>
        </div>
        
        {!isScanning && scanResult && (
          <div className="gauge-display">
            <div className={`score ${scanResult.score >= 80 ? 'high-value' : ''}`}>
              {scanResult.score}%
            </div>
            <div className="label">TARGET ALIGNMENT</div>
          </div>
        )}
      </div>

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
      {scanResult && researchData && (
        <ResearchPanel 
          researchData={researchData}
          isResearching={false}
          researchQuality={scanResult.researchQuality || 'verified'}
        />
      )}

      {/* Insights */}
      {scanResult && !isScanning && (
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
            researchData={undefined}
          />
        </div>
      )}
    </div>
  )
}