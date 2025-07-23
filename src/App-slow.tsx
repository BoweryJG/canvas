import { useState, useEffect } from 'react'
import IntegratedCanvasExperience from './components/IntegratedCanvasExperience'
import { AuthProvider } from './auth'
import { performAIScan } from './lib/ai'
import { TargetSightIcon, DoctorTargetIcon, ProductScanIcon, TacticalBriefIcon } from './components/Icons'
import EnhancedActionSuite from './components/EnhancedActionSuite'
import { saveScan, getScanHistory } from './lib/supabaseOperations'
import NavBar from './components/NavBar'
import ResearchPanel from './components/ResearchPanel'
import { conductDoctorResearch, type ResearchData } from './lib/webResearch'
import { performEnhancedAIScan } from './lib/enhancedAI'

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
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanStage, setScanStage] = useState('')
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [isResearching, setIsResearching] = useState(false)
  const [cinematicMode, setCinematicMode] = useState(false)

  const handleScan = async () => {
    if (!doctor || !product) return
    
    setIsScanning(true)
    setIsResearching(true)
    setScanResult(null)
    setResearchData(null)
    setScanStage('Initializing Intelligence Scan...')
    
    try {
      const scanStartTime = Date.now()
      
      // Stage 1: Quick AI scan for immediate results
      setScanStage('Generating Initial Analysis...')
      const quickResult = await performAIScan(doctor, product)
      setScanResult(quickResult)
      
      // Stage 2: Enhanced web research (parallel)
      setScanStage('Conducting Web Research...')
      const research = await conductDoctorResearch(doctor)
      setResearchData(research)
      setIsResearching(false)
      
      // Stage 3: Enhanced AI analysis with research data
      setScanStage('Generating Research-Based Intelligence...')
      const enhancedResult = await performEnhancedAIScan(doctor, product, research)
      
      const scanDuration = Math.round((Date.now() - scanStartTime) / 1000)
      
      // Merge enhanced results with original structure
      const finalResult = {
        ...enhancedResult,
        scanDuration,
        researchQuality: enhancedResult.researchQuality,
        researchSources: enhancedResult.researchSources,
        factBased: enhancedResult.factBased
      }
      
      setScanResult(finalResult)
      
      // Save to Supabase with enhanced data
      const saveResult = await saveScan(finalResult, null)
      if (saveResult.success) {
        console.log('Enhanced scan saved to database:', saveResult.data.id)
        setScanResult(prev => prev ? { ...prev, scanId: saveResult.data.id } : prev)
      }
      
    } catch (error) {
      console.error('Enhanced scan failed:', error)
      setIsResearching(false)
      
      // Fallback to basic scan
      try {
        setScanStage('Fallback to Basic Analysis...')
        const fallbackResult = await performAIScan(doctor, product)
        setScanResult(fallbackResult)
      } catch (fallbackError) {
        console.error('Fallback scan also failed:', fallbackError)
      }
    } finally {
      setIsScanning(false)
      setScanStage('')
    }
  }

  const loadScanHistory = async () => {
    // Load anonymous scans (user_id = null)
    const historyResult = await getScanHistory(null) 
    if (historyResult.success && historyResult.data) {
      setScanHistory(historyResult.data)
    }
  }

  useEffect(() => {
    loadScanHistory()
  }, [])

  // Show cinematic mode if enabled
  if (cinematicMode) {
    return (
      <AuthProvider>
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
      </AuthProvider>
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
        <p>AI-POWERED SALES INTELLIGENCE & RESEARCH PLATFORM</p>
        
        {/* Mode Toggle */}
        <button
          onClick={() => setCinematicMode(true)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '8px 16px',
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 2px 10px rgba(0, 255, 198, 0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ✨ TRY CINEMATIC MODE
        </button>
        
        {/* Scan History Toggle */}
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="history-toggle"
        >
          📋 Scan History ({scanHistory.length})
        </button>
      </header>

      {/* Scan History Panel */}
      {showHistory && (
        <div className="history-panel">
          <h3>🕐 SCAN HISTORY</h3>
          <div className="history-list">
            {scanHistory.map((scan, index) => (
              <div key={index} className="history-item">
                <div className="history-header">
                  <span className="doctor-name">Dr. {scan.doctor}</span>
                  <span className={`score ${scan.score >= 80 ? 'high-value' : ''}`}>
                    {scan.score}%
                  </span>
                </div>
                <div className="history-details">
                  <span className="product-name">{scan.product}</span>
                  <span className="scan-date">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setScanResult(scan)
                    setShowHistory(false)
                  }}
                  className="reload-btn"
                >
                  🔄 Reload
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              disabled={isScanning}
            />
          </div>
          <div className="input-with-icon">
            <ProductScanIcon className="input-icon" />
            <input
              type="text"
              placeholder="Product Name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              disabled={isScanning}
            />
          </div>
        </div>
        <button 
          onClick={handleScan}
          disabled={!doctor || !product || isScanning}
          className={`scan-btn ${isScanning ? 'scanning' : ''}`}
        >
          {isScanning ? 'SCANNING...' : 'LAUNCH SCAN'}
        </button>
      </div>

      {/* Iconic Gauge */}
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

      {/* Scanning Status */}
      {isScanning && (
        <div className="status">
          <p className="scanning-text">{scanStage}</p>
        </div>
      )}

      {/* Research Panel */}
      <ResearchPanel 
        researchData={researchData}
        isResearching={isResearching}
        researchQuality={scanResult?.researchQuality || 'unknown'}
      />

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

          {/* Enhanced Action Suite */}
          <EnhancedActionSuite 
            scanResult={scanResult} 
            researchData={researchData || undefined}
          />
        </div>
      )}
      </div>
    </>
  )
}

export default App