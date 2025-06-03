import { useState } from 'react'
import { getInstantResults, getQuickSearchResults } from './lib/instantResults'
import { TargetSightIcon, DoctorTargetIcon, ProductScanIcon, TacticalBriefIcon } from './components/Icons'
// @ts-ignore
import EnhancedActionSuite from './components/EnhancedActionSuite'
import NavBar from './components/NavBar'
import ResearchPanel from './components/ResearchPanel'
import IntegratedCanvasExperience from './components/IntegratedCanvasExperience'
import { AuthContextProvider } from './contexts/AuthContext'

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
  const [cinematicMode, setCinematicMode] = useState(false)

  const handleScan = async () => {
    if (!doctor || !product) return
    
    setIsScanning(true)
    setScanResult(null)
    setScanStage('Scanning...')
    
    // Show instant results IMMEDIATELY
    const instantResult = getInstantResults(doctor, product);
    setScanResult(instantResult);
    
    // Try to get real search results (but don't wait long)
    setTimeout(async () => {
      try {
        const betterResult = await getQuickSearchResults(doctor, product);
        setScanResult(betterResult);
      } catch (error) {
        console.log('Using instant results');
      }
      setIsScanning(false);
      setScanStage('');
    }, 2000);
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
          {isScanning ? 'SCANNING...' : 'INSTANT SCAN'}
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
      {isScanning && (
        <div className="status">
          <p className="scanning-text">{scanStage}</p>
        </div>
      )}

      {/* Research Panel */}
      {scanResult && (
        <ResearchPanel 
          researchData={{
            doctorName: doctor,
            practiceInfo: { name: doctor, specialties: ['Medical Professional'] },
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