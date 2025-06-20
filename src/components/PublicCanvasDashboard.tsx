import React, { useState } from 'react';
import { TargetSightIcon, ProductScanIcon, TacticalBriefIcon } from './Icons';
import { CanvasQuickLoginModal } from './CanvasQuickLoginModal';
import './LoadingStates.css';

interface PublicCanvasDashboardProps {
  onLoginSuccess?: () => void;
}

// Sample data for teaser
const sampleDoctors = [
  { name: 'Dr. Sarah Johnson', specialty: 'Orthopedic Surgery', location: 'Los Angeles, CA' },
  { name: 'Dr. Michael Chen', specialty: 'Cardiology', location: 'New York, NY' },
  { name: 'Dr. Emily Rodriguez', specialty: 'Dermatology', location: 'Miami, FL' },
  { name: 'Dr. David Williams', specialty: 'Neurology', location: 'Chicago, IL' },
  { name: 'Dr. Jessica Lee', specialty: 'Oncology', location: 'Seattle, WA' },
];

const sampleFeatures = [
  { icon: '🎯', title: 'Instant Intelligence', desc: '15-30 second tactical briefs' },
  { icon: '🔬', title: 'Deep Research', desc: '2-4 minute comprehensive analysis' },
  { icon: '🚀', title: 'Batch Processing', desc: 'Scale to 2500 doctors at once' },
  { icon: '📊', title: 'AI-Powered Analysis', desc: 'Claude Opus 4 & Sequential Thinking' }
];

const salesAgents = [
  { 
    icon: '🎯', 
    title: 'Hunter', 
    desc: 'Lead generation specialist for medical & aesthetic practices',
    capabilities: ['Prospect identification', 'Territory mapping', 'Opportunity scoring', 'Procedure-specific targeting'] 
  },
  { 
    icon: '💼', 
    title: 'Closer', 
    desc: 'Deal closing expert with procedure knowledge',
    capabilities: ['Objection handling', 'Contract negotiation', 'ROI calculations', 'Procedure pricing strategies'] 
  },
  { 
    icon: '📚', 
    title: 'Educator', 
    desc: 'Product & procedure knowledge specialist',
    capabilities: ['Feature explanations', 'Clinical benefits', 'Procedure workflows', 'Compliance guidance'] 
  },
  { 
    icon: '📊', 
    title: 'Strategist', 
    desc: 'Strategic planning with market insights',
    capabilities: ['Market analysis', 'Competitive positioning', 'Growth planning', 'Procedure trend analysis'] 
  }
];

export const PublicCanvasDashboard: React.FC<PublicCanvasDashboardProps> = ({
  onLoginSuccess
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [previewDoctor, setPreviewDoctor] = useState('');
  const [previewProduct, setPreviewProduct] = useState('');

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    onLoginSuccess?.();
  };

  const handlePreviewScan = () => {
    if (!previewDoctor || !previewProduct) return;
    
    // Show a teaser of what the scan would look like
    alert(`🔒 Sign in to generate full intelligence for ${previewDoctor} about ${previewProduct}.\n\nThis would include:\n• Tactical sales brief\n• Outreach templates\n• Practice analysis\n• Competitive intelligence`);
  };

  return (
    <div className="canvas-app mobile-container" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <header className="header mobile-stack" style={{ position: 'relative' }}>
        <div className="header-icon">
          <TargetSightIcon className="w-12 h-12 text-electric-blue" />
        </div>
        <h1><span className="glow">CANVAS</span></h1>
        <p>AI-POWERED SALES INTELLIGENCE</p>
        
        {/* Sign In Banner */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(123, 66, 246, 0.1)',
          border: '1px solid rgba(123, 66, 246, 0.3)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.85rem',
          color: '#7B42F6',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={handleLoginClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(123, 66, 246, 0.2)';
          e.currentTarget.style.color = '#00ffc6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(123, 66, 246, 0.1)';
          e.currentTarget.style.color = '#7B42F6';
        }}
        >
          🔓 Sign In
        </div>
      </header>

      {/* Preview Mode Alert */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
        border: '1px solid rgba(123, 66, 246, 0.3)',
        borderRadius: '12px',
        padding: '1rem',
        margin: '1rem',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#00ffc6' }}>
          🚀 Preview Mode Active
        </h3>
        <p style={{ margin: '0 0 1rem 0', opacity: 0.8, fontSize: '0.9rem' }}>
          Try the interface below, then sign in to unlock full AI-powered intelligence generation
        </p>
        <button
          onClick={handleLoginClick}
          style={{
            background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            padding: '12px 24px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(123, 66, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 66, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(123, 66, 246, 0.3)';
          }}
        >
          🎯 Sign In to Start
        </button>
      </div>

      {/* Features Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        margin: '2rem 1rem',
      }}>
        {sampleFeatures.map((feature, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#00ffc6' }}>{feature.title}</h4>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* AI Sales Agents Preview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.05) 0%, rgba(0, 255, 198, 0.05) 100%)',
        border: '1px solid rgba(123, 66, 246, 0.2)',
        borderRadius: '16px',
        margin: '2rem 1rem',
        padding: '1.5rem'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#00ffc6' }}>
          🤖 AI Sales Agents
        </h3>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem', fontSize: '0.9rem' }}>
          Your intelligent sales companions - always ready to assist
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {salesAgents.map((agent, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 198, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={handleLoginClick}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                {agent.icon}
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#00ffc6', textAlign: 'center' }}>
                {agent.title}
              </h4>
              <p style={{ margin: '0 0 1rem 0', opacity: 0.8, fontSize: '0.85rem', textAlign: 'center' }}>
                {agent.desc}
              </p>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                  Capabilities:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  {agent.capabilities.map((cap, capIndex) => (
                    <li key={capIndex} style={{ marginBottom: '0.25rem' }}>{cap}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(123, 66, 246, 0.1)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
            🔒 <strong>Sign in to chat with AI Sales Agents</strong>
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
            Get personalized advice, real-time insights, and strategic guidance
          </p>
        </div>
      </div>

      {/* Interactive Preview Form */}
      <div className="scan-form mobile-form" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        margin: '2rem 1rem',
        padding: '1.5rem'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#00ffc6' }}>
          Try the Interface (Preview Mode)
        </h3>

        {/* Doctor Selection Preview */}
        <div className="mobile-stack-lg">
          <div className="input-with-icon">
            <TargetSightIcon className="input-icon" />
            <select
              className="mobile-input"
              value={previewDoctor}
              onChange={(e) => setPreviewDoctor(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '8px',
                padding: '12px'
              }}
            >
              <option value="">Select a Doctor (Sample)</option>
              {sampleDoctors.map((doctor, index) => (
                <option key={index} value={doctor.name} style={{ background: '#1a1a2e' }}>
                  {doctor.name} - {doctor.specialty} - {doctor.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Input */}
        <div className="mobile-grid">
          <div className="input-with-icon">
            <ProductScanIcon className="input-icon" />
            <input
              type="text"
              className="mobile-input"
              placeholder="Product Name (e.g., CBCT Scanner)"
              value={previewProduct}
              onChange={(e) => setPreviewProduct(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
          </div>
        </div>

        {/* Preview Generate Button */}
        {previewDoctor && previewProduct && (
          <button
            onClick={handlePreviewScan}
            className="scan-btn mobile-button touch-target"
            style={{
              marginTop: '1rem',
              width: '100%',
              background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              padding: '15px 30px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(123, 66, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 66, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(123, 66, 246, 0.3)';
            }}
          >
            🎯 GENERATE INTEL (Preview)
          </button>
        )}

        <p style={{
          textAlign: 'center',
          marginTop: '1rem',
          opacity: 0.7,
          fontSize: '0.8rem'
        }}>
          💡 This is just a preview. Sign in to generate real AI-powered intelligence.
        </p>
      </div>

      {/* Sample Intelligence Preview */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        margin: '2rem 1rem',
        padding: '1.5rem',
        position: 'relative'
      }}>
        {/* Blur overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#00ffc6' }}>Sample Intelligence Report</h3>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.8 }}>
              See what Canvas generates for each doctor-product combination
            </p>
            <button
              onClick={handleLoginClick}
              style={{
                background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                padding: '12px 24px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Unlock Full Access
            </button>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', color: '#00ffc6' }}>
          <TacticalBriefIcon className="inline w-5 h-5 mr-2" />
          TACTICAL SALES BRIEF
        </h3>
        <div style={{ opacity: 0.3 }}>
          <p>**Position CBCT as a competitive advantage for Dr. Johnson's orthopedic practice**</p>
          <p>Dr. Johnson's practice shows strong technology adoption patterns with recent EMR upgrades. The practice handles 200+ procedures monthly, suggesting strong cash flow for equipment investments.</p>
          <p>**Key talking points:**</p>
          <ul>
            <li>3D imaging reduces revision surgeries by 15-20%</li>
            <li>Current 2D workflow creates bottlenecks in complex cases</li>
            <li>Competitive practices in LA already using advanced imaging</li>
          </ul>
          <p>**Recommended approach:** Schedule demo during their Tuesday planning meetings. Dr. Johnson responds well to data-driven presentations.</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: 'center',
        margin: '3rem 1rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
        border: '1px solid rgba(123, 66, 246, 0.3)',
        borderRadius: '16px'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Ready to Generate Real Intelligence?</h2>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
          Join sales professionals using Canvas to close more deals with AI-powered insights
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleLoginClick}
            style={{
              background: 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              padding: '15px 30px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(123, 66, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 66, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(123, 66, 246, 0.3)';
            }}
          >
            🎯 Start Free Trial
          </button>
          <button
            onClick={handleLoginClick}
            style={{
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50px',
              color: 'white',
              padding: '13px 28px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00ffc6';
              e.currentTarget.style.background = 'rgba(0, 255, 198, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            👤 Sign In
          </button>
        </div>
      </div>

      {/* Login Modal */}
      <CanvasQuickLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};