import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressStep {
  id: string;
  label: string;
  sublabel?: string;
  status: 'pending' | 'active' | 'completed' | 'found';
  result?: string;
}

interface IntelligenceProgressProps {
  steps: ProgressStep[];
  currentStage: string;
  sourcesFound: number;
  confidenceScore: number;
}

export const IntelligenceProgress: React.FC<IntelligenceProgressProps> = ({
  steps,
  currentStage,
  sourcesFound,
  confidenceScore
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="intelligence-progress"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.05) 0%, rgba(123, 66, 246, 0.05) 100%)',
        border: '1px solid rgba(0, 255, 198, 0.2)',
        borderRadius: '20px',
        padding: '30px',
        marginTop: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background effect */}
      <div 
        className="progress-glow"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(0, 255, 198, 0.1) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />
      
      {/* Header with live stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '25px',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Building Your Intelligence Arsenal
          </h3>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.9rem',
            marginTop: '5px'
          }}>
            {currentStage}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              key={sourcesFound}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ 
                fontSize: '2rem', 
                fontWeight: '700',
                color: '#00ffc6'
              }}
            >
              {sourcesFound}
            </motion.div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Sources Found
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ 
                color: confidenceScore > 80 ? '#00ffc6' : confidenceScore > 60 ? '#f59e0b' : '#ef4444'
              }}
              style={{ 
                fontSize: '2rem', 
                fontWeight: '700'
              }}
            >
              {confidenceScore}%
            </motion.div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Confidence
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress steps */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="sync">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { delay: index * 0.1 }
              }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                padding: '15px',
                borderRadius: '12px',
                background: step.status === 'active' 
                  ? 'rgba(0, 255, 198, 0.1)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  step.status === 'active' ? 'rgba(0, 255, 198, 0.3)' :
                  step.status === 'completed' ? 'rgba(0, 255, 198, 0.2)' :
                  step.status === 'found' ? 'rgba(123, 66, 246, 0.3)' :
                  'rgba(255, 255, 255, 0.05)'
                }`
              }}
            >
              {/* Status indicator */}
              <div style={{ marginRight: '15px' }}>
                {step.status === 'pending' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.3)'
                    }} />
                  </div>
                )}
                
                {step.status === 'active' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    position: 'relative'
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderTopColor: '#00ffc6',
                        borderRightColor: '#00ffc6'
                      }}
                    />
                  </div>
                )}
                
                {step.status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0, 255, 198, 0.2)',
                      border: '2px solid #00ffc6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00ffc6',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓
                  </motion.div>
                )}
                
                {step.status === 'found' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(123, 66, 246, 0.2)',
                      border: '2px solid #7B42F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7B42F6',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}
                  >
                    ★
                  </motion.div>
                )}
              </div>
              
              {/* Step content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  color: step.status === 'active' ? '#00ffc6' : 
                         step.status === 'completed' ? 'rgba(255, 255, 255, 0.9)' :
                         step.status === 'found' ? '#7B42F6' :
                         'rgba(255, 255, 255, 0.5)'
                }}>
                  {step.label}
                </div>
                {step.sublabel && (
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: '2px'
                  }}>
                    {step.sublabel}
                  </div>
                )}
              </div>
              
              {/* Result indicator */}
              {step.result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    fontSize: '0.85rem',
                    color: '#00ffc6',
                    fontWeight: '500'
                  }}
                >
                  {step.result}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Claude synthesis indicator */}
      {steps.some(s => s.id === 'synthesis' && s.status === 'active') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(123, 66, 246, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            background: 'linear-gradient(90deg, #7B42F6 0%, #00ffc6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            🧠 Claude 4 Opus Processing {sourcesFound} Intelligence Sources
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '5px'
          }}>
            Creating your personalized sales intelligence masterpiece
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            Ready to deploy across email, SMS, LinkedIn, and more...
          </div>
        </motion.div>
      )}
      
      {/* What we're building message */}
      {sourcesFound > 10 && steps.some(s => s.status === 'active' || s.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '25px',
            padding: '20px',
            background: 'rgba(0, 255, 198, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 255, 198, 0.2)'
          }}
        >
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#00ffc6',
            marginBottom: '10px'
          }}>
            🚀 What We're Building For You
          </h4>
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.6'
          }}>
            <div style={{ marginBottom: '8px' }}>
              ✦ <strong>Hyper-Personalized Content</strong> - Not generic templates, but intelligence crafted specifically for {steps[0]?.label?.includes('Dr.') ? 'this doctor' : 'your target'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✦ <strong>Multi-Channel Ready</strong> - One click to deploy via Email, SMS, LinkedIn, or Magic Link
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✦ <strong>Conversation Starters</strong> - Specific talking points based on their actual technology stack and pain points
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✦ <strong>Objection Handlers</strong> - Pre-emptive responses to their likely concerns
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✦ <strong>Follow-Up Sequences</strong> - Automated nurture campaigns tailored to their buying signals
            </div>
          </div>
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(123, 66, 246, 0.1)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center'
          }}>
            💡 <strong>This isn't just research</strong> - it's your complete sales arsenal, ready to deploy
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default IntelligenceProgress;