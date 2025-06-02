import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BatchAnalysisEngine,
  type BatchDoctorInput,
  type BatchAnalysisResult,
  type BatchAnalysisProgress,
  type BatchAnalysisOptions,
  exportBatchResultsToCSV,
  importDoctorsFromCSV,
  generateBatchSummary
} from '../lib/batchAnalysis';

interface BatchAnalysisPanelProps {
  onClose?: () => void;
}

const BatchAnalysisPanel: React.FC<BatchAnalysisPanelProps> = ({ onClose }) => {
  const [doctors, setDoctors] = useState<BatchDoctorInput[]>([]);
  const [results, setResults] = useState<BatchAnalysisResult[]>([]);
  const [progress, setProgress] = useState<BatchAnalysisProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'progress' | 'results' | 'summary'>('input');
  const [options, setOptions] = useState<BatchAnalysisOptions>({
    includeWebResearch: true,
    maxConcurrent: 3,
    delayBetweenRequests: 2000,
    prioritizeHighValue: true,
    skipLowConfidence: false,
    confidenceThreshold: 40
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<BatchAnalysisEngine | null>(null);

  /**
   * Add a new doctor manually
   */
  const addDoctor = useCallback(() => {
    const newDoctor: BatchDoctorInput = {
      id: `manual_${Date.now()}`,
      doctor: '',
      practice: '',
      specialty: '',
      location: '',
      email: '',
      phone: '',
      website: '',
      notes: ''
    };
    setDoctors(prev => [...prev, newDoctor]);
  }, []);

  /**
   * Update doctor information
   */
  const updateDoctor = useCallback((id: string, field: keyof BatchDoctorInput, value: string) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  }, []);

  /**
   * Remove doctor from list
   */
  const removeDoctor = useCallback((id: string) => {
    setDoctors(prev => prev.filter(doc => doc.id !== id));
  }, []);

  /**
   * Import doctors from CSV file
   */
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const importedDoctors = importDoctorsFromCSV(csvContent);
        setDoctors(prev => [...prev, ...importedDoctors]);
        console.log(`✅ Imported ${importedDoctors.length} doctors from CSV`);
      } catch (error) {
        console.error('CSV import error:', error);
        alert('Failed to import CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Start batch analysis
   */
  const startAnalysis = useCallback(async () => {
    if (doctors.length === 0) {
      alert('Please add doctors to analyze');
      return;
    }

    setIsRunning(true);
    setActiveTab('progress');
    setResults([]);
    
    try {
      // Create new analysis engine
      const engine = new BatchAnalysisEngine(options);
      engineRef.current = engine;

      // Set up callbacks
      engine.onProgress((newProgress) => {
        setProgress(newProgress);
      });

      engine.onResult((result) => {
        setResults(prev => {
          const existingIndex = prev.findIndex(r => r.input.id === result.input.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = result;
            return updated;
          } else {
            return [...prev, result];
          }
        });
      });

      // Start analysis
      await engine.startBatchAnalysis(doctors);
      
      // Switch to results tab when complete
      setActiveTab('results');
      
    } catch (error) {
      console.error('Batch analysis error:', error);
      alert('Batch analysis failed. Please try again.');
    } finally {
      setIsRunning(false);
      engineRef.current = null;
    }
  }, [doctors, options]);

  /**
   * Stop analysis
   */
  const stopAnalysis = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stopBatchAnalysis();
    }
    setIsRunning(false);
  }, []);

  /**
   * Export results to CSV
   */
  const exportResults = useCallback(() => {
    if (results.length === 0) return;

    const csvContent = exportBatchResultsToCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvas-batch-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [results]);

  /**
   * Clear all data
   */
  const clearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all data?')) {
      setDoctors([]);
      setResults([]);
      setProgress(null);
      setActiveTab('input');
    }
  }, []);

  // Generate summary
  const summary = results.length > 0 ? generateBatchSummary(results) : null;

  return (
    <motion.div
      className="batch-analysis-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header */}
      <div className="panel-header">
        <div className="header-content">
          <h2>🔬 Batch Doctor Analysis</h2>
          <p>Analyze multiple doctors simultaneously for efficient prospecting</p>
        </div>
        <div className="header-actions">
          <span className="doctor-count">{doctors.length} doctors loaded</span>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs">
        <button 
          className={`tab ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          📝 Input Data
        </button>
        <button 
          className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
          disabled={!progress && !isRunning}
        >
          ⚡ Progress
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={results.length === 0}
        >
          📊 Results ({results.filter(r => r.status === 'completed').length})
        </button>
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
          disabled={!summary}
        >
          📈 Summary
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="input-tab"
            >
              {/* Import/Export Actions */}
              <div className="input-actions">
                <div className="import-section">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="import-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📄 Import CSV
                  </button>
                  <button className="add-btn" onClick={addDoctor}>
                    ➕ Add Doctor
                  </button>
                </div>
                <div className="action-section">
                  <button className="clear-btn" onClick={clearAll} disabled={doctors.length === 0}>
                    🗑️ Clear All
                  </button>
                  <button 
                    className="start-btn" 
                    onClick={startAnalysis}
                    disabled={doctors.length === 0 || isRunning}
                  >
                    {isRunning ? '⏳ Analyzing...' : '🚀 Start Analysis'}
                  </button>
                </div>
              </div>

              {/* Analysis Options */}
              <div className="analysis-options">
                <h4>⚙️ Analysis Options</h4>
                <div className="options-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={options.includeWebResearch}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeWebResearch: e.target.checked }))}
                    />
                    Include web research
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.prioritizeHighValue}
                      onChange={(e) => setOptions(prev => ({ ...prev, prioritizeHighValue: e.target.checked }))}
                    />
                    Prioritize high-value prospects
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.skipLowConfidence}
                      onChange={(e) => setOptions(prev => ({ ...prev, skipLowConfidence: e.target.checked }))}
                    />
                    Skip low-confidence matches
                  </label>
                  <div className="range-option">
                    <label>Max concurrent: {options.maxConcurrent}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={options.maxConcurrent}
                      onChange={(e) => setOptions(prev => ({ ...prev, maxConcurrent: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="range-option">
                    <label>Confidence threshold: {options.confidenceThreshold}%</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={options.confidenceThreshold}
                      onChange={(e) => setOptions(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              {/* Doctor List */}
              <div className="doctor-list">
                <h4>👥 Doctor List ({doctors.length})</h4>
                {doctors.length === 0 ? (
                  <div className="empty-state">
                    <p>No doctors added yet. Import a CSV file or add doctors manually.</p>
                    <div className="csv-format-hint">
                      <strong>CSV Format:</strong> Doctor Name, Practice, Specialty, Location, Email, Phone, Website
                    </div>
                  </div>
                ) : (
                  <div className="doctor-grid">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="doctor-card">
                        <div className="doctor-header">
                          <input
                            type="text"
                            placeholder="Doctor Name *"
                            value={doctor.doctor}
                            onChange={(e) => updateDoctor(doctor.id, 'doctor', e.target.value)}
                            className="doctor-name-input"
                          />
                          <button
                            className="remove-doctor-btn"
                            onClick={() => removeDoctor(doctor.id)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="doctor-fields">
                          <input
                            type="text"
                            placeholder="Practice"
                            value={doctor.practice}
                            onChange={(e) => updateDoctor(doctor.id, 'practice', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Specialty"
                            value={doctor.specialty}
                            onChange={(e) => updateDoctor(doctor.id, 'specialty', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Location"
                            value={doctor.location}
                            onChange={(e) => updateDoctor(doctor.id, 'location', e.target.value)}
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={doctor.email}
                            onChange={(e) => updateDoctor(doctor.id, 'email', e.target.value)}
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={doctor.phone}
                            onChange={(e) => updateDoctor(doctor.id, 'phone', e.target.value)}
                          />
                          <input
                            type="url"
                            placeholder="Website"
                            value={doctor.website}
                            onChange={(e) => updateDoctor(doctor.id, 'website', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && progress && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="progress-tab"
            >
              <div className="progress-overview">
                <h4>⚡ Analysis Progress</h4>
                <div className="progress-stats">
                  <div className="stat">
                    <span className="stat-value">{progress.completed + progress.failed}</span>
                    <span className="stat-label">of {progress.total} processed</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{progress.completed}</span>
                    <span className="stat-label">successful</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{progress.failed}</span>
                    <span className="stat-label">failed</span>
                  </div>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${((progress.completed + progress.failed) / progress.total) * 100}%` 
                    }}
                  />
                </div>
                <div className="progress-percentage">
                  {Math.round(((progress.completed + progress.failed) / progress.total) * 100)}%
                </div>
              </div>

              {progress.currentDoctor && (
                <div className="current-processing">
                  <strong>Currently processing:</strong> {progress.currentDoctor}
                </div>
              )}

              {progress.estimatedTimeRemaining && (
                <div className="time-estimate">
                  <strong>Estimated time remaining:</strong> {Math.round(progress.estimatedTimeRemaining / 1000)}s
                </div>
              )}

              {isRunning && (
                <div className="progress-actions">
                  <button className="stop-btn" onClick={stopAnalysis}>
                    ⏹️ Stop Analysis
                  </button>
                </div>
              )}

              {/* Real-time Results Preview */}
              <div className="live-results">
                <h5>📊 Live Results</h5>
                <div className="live-results-grid">
                  {results.slice(-6).map((result) => (
                    <div key={result.input.id} className={`result-preview ${result.status}`}>
                      <div className="result-name">{result.input.doctor}</div>
                      <div className="result-status">
                        {result.status === 'completed' && result.scanResult && (
                          <span className="score">{result.scanResult.score}%</span>
                        )}
                        {result.status === 'failed' && (
                          <span className="error">❌ Failed</span>
                        )}
                        {result.status === 'processing' && (
                          <span className="processing">⏳ Processing</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="results-tab"
            >
              <div className="results-header">
                <h4>📊 Analysis Results</h4>
                <div className="results-actions">
                  <button className="export-btn" onClick={exportResults} disabled={results.length === 0}>
                    📥 Export CSV
                  </button>
                </div>
              </div>

              <div className="results-grid">
                {results.map((result) => (
                  <div key={result.input.id} className={`result-card ${result.status}`}>
                    <div className="result-header">
                      <h5>{result.input.doctor}</h5>
                      <div className="result-status-badge">
                        {result.status === 'completed' && result.scanResult && (
                          <span className="score-badge">{result.scanResult.score}%</span>
                        )}
                        {result.status === 'failed' && (
                          <span className="error-badge">Failed</span>
                        )}
                      </div>
                    </div>

                    <div className="result-details">
                      {result.input.practice && (
                        <div className="detail">
                          <strong>Practice:</strong> {result.input.practice}
                        </div>
                      )}
                      {result.input.specialty && (
                        <div className="detail">
                          <strong>Specialty:</strong> {result.input.specialty}
                        </div>
                      )}
                      {result.scanResult && (
                        <>
                          <div className="detail">
                            <strong>Research Quality:</strong> {result.scanResult.researchQuality}
                          </div>
                          <div className="detail">
                            <strong>Key Insights:</strong>
                            <ul>
                              {result.scanResult.insights?.slice(0, 2).map((insight: string, i: number) => (
                                <li key={i}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      {result.error && (
                        <div className="detail error">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      {result.processingTime && (
                        <div className="detail processing-time">
                          <strong>Processing Time:</strong> {result.processingTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && summary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="summary-tab"
            >
              <div className="summary-overview">
                <h4>📈 Analysis Summary</h4>
                
                <div className="summary-stats">
                  <div className="stat-card">
                    <div className="stat-value">{summary.totalAnalyzed}</div>
                    <div className="stat-label">Total Analyzed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{summary.averageScore}%</div>
                    <div className="stat-label">Average Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{summary.successful}</div>
                    <div className="stat-label">Successful</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{summary.failed}</div>
                    <div className="stat-label">Failed</div>
                  </div>
                </div>
              </div>

              <div className="priority-breakdown">
                <h5>🎯 Lead Prioritization</h5>
                <div className="priority-stats">
                  <div className="priority-item high">
                    <span className="priority-count">{summary.highPriorityLeads}</span>
                    <span className="priority-label">High Priority (80%+)</span>
                  </div>
                  <div className="priority-item medium">
                    <span className="priority-count">{summary.mediumPriorityLeads}</span>
                    <span className="priority-label">Medium Priority (60-79%)</span>
                  </div>
                  <div className="priority-item low">
                    <span className="priority-count">{summary.lowPriorityLeads}</span>
                    <span className="priority-label">Low Priority (&lt;60%)</span>
                  </div>
                </div>
              </div>

              <div className="specialty-analysis">
                <h5>🏥 Top Specialties</h5>
                <div className="specialty-list">
                  {summary.topSpecialties.map((specialty, index) => (
                    <div key={specialty.specialty} className="specialty-item">
                      <div className="specialty-rank">#{index + 1}</div>
                      <div className="specialty-info">
                        <div className="specialty-name">{specialty.specialty}</div>
                        <div className="specialty-stats">
                          {specialty.count} doctors • {specialty.avgScore.toFixed(1)}% avg score
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recommendations">
                <h5>💡 Recommendations</h5>
                <div className="recommendation-list">
                  {summary.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="recommendation-icon">•</span>
                      <span className="recommendation-text">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BatchAnalysisPanel;