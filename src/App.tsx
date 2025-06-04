import { useState } from 'react'
import { getInstantResults } from './lib/instantResults'
import { TargetSightIcon, DoctorTargetIcon, ProductScanIcon, TacticalBriefIcon, LocationTargetIcon } from './components/Icons'
// @ts-ignore
import EnhancedActionSuite from './components/EnhancedActionSuite'
import NavBar from './components/NavBar'
import ResearchPanel from './components/ResearchPanel'
import IntegratedCanvasExperience from './components/IntegratedCanvasExperience'
import DoctorVerification from './components/DoctorVerification'
import { AuthContextProvider } from './contexts/AuthContext'
import { analyzeDoctor } from './lib/intelligentAnalysis'
import { performEnhancedResearch, generateEnhancedSalesBrief } from './lib/enhancedResearch'

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
import './App.css'

function App() {
  const [doctor, setDoctor] = useState('')
  const [product, setProduct] = useState('')
  const [location, setLocation] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanStage, setScanStage] = useState('')
  const [cinematicMode, setCinematicMode] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false)

  const handleScan = async () => {
    if (!doctor || !product) return
    
    setIsScanning(true)
    setScanResult(null)
    setScanStage('Verifying doctor identity...')
    setShowVerification(true)
    
    // Start verification process immediately
    setIsScanning(false)
  }

  const handleDoctorConfirmed = async (profile: any) => {
    setShowVerification(false)
    setIsGeneratingBrief(true)
    setScanStage('Performing deep industry analysis...')
    
    try {
      // Step 1: Basic analysis
      const analysis = await analyzeDoctor(profile.name, profile.location, product)
      
      // Step 2: Enhanced industry-specific research
      setScanStage('Analyzing practice metrics & technology stack...')
      const enhancedProfile = await performEnhancedResearch(
        profile.name,
        profile.location,
        product,
        profile
      )
      
      // Step 3: Generate strategic sales brief
      setScanStage('Creating strategic sales brief...')
      const strategicBrief = generateEnhancedSalesBrief(
        enhancedProfile,
        profile.name,
        product
      )
      
      // Create enhanced scan result with deep insights
      const enhancedResult: ScanResult = {
        doctor: profile.name,
        product: product,
        score: analysis.interestLevel,
        doctorProfile: `${analysis.synthesis}\n\n**Practice Profile**: ${enhancedProfile.prospectType.replace('_', ' ')} | ${enhancedProfile.businessMetrics.practiceSize} practice | ${enhancedProfile.businessMetrics.technologyAdoption.replace('_', ' ')} adopter`,
        productIntel: analysis.productAlignment,
        salesBrief: strategicBrief,
        insights: [
          `✅ Verified ${enhancedProfile.prospectType.replace('_', ' ')} - ${enhancedProfile.businessMetrics.decisionMakingSpeed} decision maker`,
          `🎯 Technology adoption: ${enhancedProfile.businessMetrics.technologyAdoption}`,
          `📊 Practice size: ${enhancedProfile.businessMetrics.practiceSize}`,
          ...enhancedProfile.buyingSignals.map(signal => `💡 ${signal}`),
          ...analysis.keyFactors
        ],
        researchQuality: 'verified' as const,
        researchSources: profile.sources?.length || 0,
        factBased: true
      }
      
      setScanResult(enhancedResult)
    } catch (error) {
      // Fallback to instant results if analysis fails
      const fallbackResult = getInstantResults(doctor, product)
      setScanResult(fallbackResult)
    } finally {
      setIsGeneratingBrief(false)
      setScanStage('')
    }
  }

  const handleDoctorRejected = () => {
    setShowVerification(false)
    // Reset form to let user try again
  }

  if (cinematicMode) {
    return (
      <AuthContextProvider>
        <>
          <NavBar />
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
      </AuthContextProvider>
    )
  }

  return (
    <>
      <NavBar />
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
            <input
              type="text"
              placeholder="Doctor Name"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              disabled={isScanning || showVerification || isGeneratingBrief}
            />
          </div>
          <div className="input-with-icon">
            <ProductScanIcon className="input-icon" />
            <input
              type="text"
              placeholder="Product Name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              disabled={isScanning || showVerification || isGeneratingBrief}
            />
          </div>
          <div className="input-with-icon">
            <LocationTargetIcon className="input-icon" />
            <input
              type="text"
              placeholder="Location (City, State)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isScanning || showVerification || isGeneratingBrief}
            />
          </div>
        </div>
        <button 
          onClick={handleScan}
          disabled={!doctor || !product || isScanning || showVerification || isGeneratingBrief}
          className={`scan-btn ${(isScanning || showVerification || isGeneratingBrief) ? 'scanning' : ''}`}
        >
          {showVerification ? 'VERIFYING...' : isGeneratingBrief ? 'ANALYZING...' : isScanning ? 'SCANNING...' : 'VERIFY & SCAN'}
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

      {/* Status */}
      {(isScanning || isGeneratingBrief) && (
        <div className="status">
          <p className="scanning-text">{scanStage}</p>
        </div>
      )}

      {/* Doctor Verification */}
      {showVerification && (
        <div style={{ marginTop: '2rem' }}>
          <DoctorVerification 
            doctorName={doctor}
            location={location}
            onConfirm={handleDoctorConfirmed}
            onReject={handleDoctorRejected}
          />
        </div>
      )}

      {/* Research Panel */}
      {scanResult && (
        <ResearchPanel 
          researchData={{
            doctorName: doctor,
            practiceInfo: { name: doctor, specialties: ['Medical Professional'], address: location || undefined },
            credentials: {},
            reviews: {},
            sources: [],
            businessIntel: {
              practiceType: 'Medical Practice',
              patientVolume: 'Medium',
              marketPosition: 'Established',
              recentNews: [],
              growthIndicators: []
            },
            confidenceScore: scanResult.score,
            completedAt: new Date().toISOString()
          }}
          isResearching={false}
          researchQuality={scanResult.researchQuality || 'inferred'}
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
    </>
  )
}

export default App