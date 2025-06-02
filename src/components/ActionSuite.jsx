import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function ActionSuite({ scanResult }) {
  const [showOutreach, setShowOutreach] = useState(false)
  const [generating, setGenerating] = useState(false)

  const generatePDF = async () => {
    // PDF generation logic
    console.log('Generating PDF brief...')
  }

  const generateDeepResearch = async () => {
    setGenerating(true)
    // Trigger 20-page deep research
    console.log('Generating deep research report...')
    setTimeout(() => setGenerating(false), 3000)
  }

  const openTwilioDialer = () => {
    // Initialize Twilio voice widget
    console.log('Opening Twilio dialer...')
  }

  const outreachTemplates = [
    {
      id: 'first-market',
      title: 'First-to-Market Opportunity',
      urgency: 'HIGH',
      hook: `Dr. ${scanResult.doctor}, breakthrough innovation alert`,
      preview: 'Position yourself as an early adopter of cutting-edge technology...'
    },
    {
      id: 'competitive-edge', 
      title: 'Competitive Intelligence',
      urgency: 'MEDIUM',
      hook: `What your competitors don\'t know about ${scanResult.product}`,
      preview: 'Exclusive insights your competition hasn\'t discovered yet...'
    },
    {
      id: 'roi-focused',
      title: 'ROI & Efficiency Play',
      urgency: 'MEDIUM', 
      hook: 'Immediate practice efficiency gains available',
      preview: 'Show concrete numbers and productivity improvements...'
    },
    {
      id: 'patient-outcomes',
      title: 'Patient Outcome Excellence',
      urgency: 'LOW',
      hook: 'Enhanced patient satisfaction opportunity',
      preview: 'Focus on improved patient experience and clinical results...'
    }
  ]

  return (
    <motion.div 
      className="action-suite"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Primary Actions */}
      <div className="primary-actions">
        <button onClick={generatePDF} className="action-btn primary">
          <span className="btn-icon">📄</span>
          Export Brief
        </button>
        
        <button onClick={generateDeepResearch} className="action-btn research" disabled={generating}>
          <span className="btn-icon">🔬</span>
          {generating ? 'Generating...' : 'Deep Research'}
        </button>
        
        <button onClick={() => setShowOutreach(!showOutreach)} className="action-btn outreach">
          <span className="btn-icon">🎯</span>
          Tactical Outreach
        </button>
      </div>

      {/* Outreach Templates */}
      {showOutreach && (
        <motion.div 
          className="outreach-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h3>🚀 TACTICAL OUTREACH OPTIONS</h3>
          
          <div className="templates-grid">
            {outreachTemplates.map((template) => (
              <div key={template.id} className={`template-card urgency-${template.urgency.toLowerCase()}`}>
                <div className="template-header">
                  <span className={`urgency-badge ${template.urgency.toLowerCase()}`}>
                    {template.urgency}
                  </span>
                  <h4>{template.title}</h4>
                </div>
                
                <div className="template-hook">
                  "{template.hook}"
                </div>
                
                <div className="template-preview">
                  {template.preview}
                </div>
                
                <div className="template-actions">
                  <button className="template-btn email">
                    📧 Generate Email
                  </button>
                  <button className="template-btn call" onClick={openTwilioDialer}>
                    📞 Call Now
                  </button>
                  <button className="template-btn text">
                    💬 Send SMS
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Twilio Widget Area */}
          <div className="twilio-widget">
            <div className="widget-header">
              <span className="pulse-dot"></span>
              LIVE CONNECT READY
            </div>
            <div className="widget-content">
              <p>Twilio integration active - Click any "Call Now" to dial directly</p>
              <div className="quick-actions">
                <button className="quick-btn">🔥 Priority Call</button>
                <button className="quick-btn">📨 Smart Email</button>
                <button className="quick-btn">⚡ Urgent SMS</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}