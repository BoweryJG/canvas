import { useState, useEffect } from 'react'
import { performAIScan } from './lib/ai'
import { TargetSightIcon, DoctorTargetIcon, ProductScanIcon, TacticalBriefIcon } from './components/Icons'
// @ts-ignore
import ActionSuite from './components/ActionSuite'
// @ts-ignore
import { saveScan, getScanHistory } from './lib/supabase'

interface ScanResult {
  doctor: string;
  product: string;
  score: number;
  doctorProfile: string;
  productIntel: string;
  salesBrief: string;
  insights: string[];
}
import './App.css'

function App() {
  const [doctor, setDoctor] = useState('')
  const [product, setProduct] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanStage, setScanStage] = useState('')
  const [scanHistory, setScanHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleScan = async () => {
    if (!doctor || !product) return
    
    setIsScanning(true)
    setScanResult(null)
    setScanStage('Analyzing Doctor Profile...')
    
    setTimeout(() => setScanStage('Analyzing Product Match...'), 1000)
    setTimeout(() => setScanStage('Generating Sales Strategy...'), 2000)
    
    try {
      const scanStartTime = Date.now()
      const result = await performAIScan(doctor, product)
      const scanDuration = Math.round((Date.now() - scanStartTime) / 1000)
      
      // Add scan duration to result
      const resultWithDuration = { ...result, scanDuration }
      setScanResult(resultWithDuration)
      
      // Save to Supabase with null user_id (anonymous scans)
      const saveResult = await saveScan(resultWithDuration, null)
      if (saveResult.success) {
        console.log('Scan saved to database:', saveResult.data.id)
        setScanResult(prev => prev ? { ...prev, scanId: saveResult.data.id } : prev)
      }
      
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setIsScanning(false)
      setScanStage('')
    }
  }

  const loadScanHistory = async () => {
    // Load anonymous scans (user_id = null)
    const historyResult = await getScanHistory(null) 
    if (historyResult.success) {
      setScanHistory(historyResult.data)
    }
  }

  useEffect(() => {
    loadScanHistory()
  }, [])

  return (
    <div className="canvas-app">
      {/* Header */}
      <header className="header">
        <div className="header-icon">
          <TargetSightIcon className="w-12 h-12 text-electric-blue" />
        </div>
        <h1><span className="glow">CANVAS</span></h1>
        <p>INTERSTELLAR SALES INTELLIGENCE MODULE</p>
        
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
              <div key={scan.id || index} className="history-item">
                <div className="history-header">
                  <span className="doctor-name">Dr. {scan.doctor_name}</span>
                  <span className={`score ${scan.score >= 80 ? 'high-value' : ''}`}>
                    {scan.score}%
                  </span>
                </div>
                <div className="history-details">
                  <span className="product-name">{scan.product_name}</span>
                  <span className="scan-date">
                    {new Date(scan.created_at).toLocaleDateString()}
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

          {/* Complete Action Suite */}
          <ActionSuite scanResult={scanResult} />
        </div>
      )}
    </div>
  )
}

export default App