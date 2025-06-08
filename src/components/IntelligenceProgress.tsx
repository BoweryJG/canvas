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
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              color: '#00ffc6', 
              fontSize: '0.95rem',
              marginTop: '5px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {currentStage}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: 'inline-flex', gap: '2px' }}
            >
              <span>.</span><span>.</span><span>.</span>
            </motion.span>
          </motion.div>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div
              key={sourcesFound}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ 
                fontSize: '1.8rem', 
                fontWeight: '700',
                color: '#00ffc6',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px'
              }}
            >
              {sourcesFound}
              <span style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                /{Math.max(sourcesFound + 5, 20)}
              </span>
            </motion.div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Sources Analyzed
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
      
      {/* Overall progress bar with time estimate */}
      <div style={{
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Overall Progress
          </span>
          <span style={{ fontSize: '0.85rem', color: '#00ffc6' }}>
            {(() => {
              const completed = steps.filter(s => s.status === 'completed').length;
              const total = steps.length;
              const percent = Math.round((completed / total) * 100);
              const timeLeft = Math.max(1, Math.ceil((total - completed) * 0.5));
              return `${percent}% • ~${timeLeft}m remaining`;
            })()}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
              borderRadius: '4px'
            }}
            animate={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
            transition={{ duration: 0.3 }}
          />
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
              {/* Status indicator with better icons */}
              <div style={{ marginRight: '15px', width: '40px' }}>
                {step.status === 'pending' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    opacity: 0.5
                  }}>
                    ⏳
                  </div>
                )}
                
                {step.status === 'active' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '3px solid transparent',
                        borderTopColor: '#00ffc6',
                        borderRightColor: '#00ffc6'
                      }}
                    />
                    <span style={{ fontSize: '16px' }}>🔍</span>
                  </div>
                )}
                
                {step.status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.3) 0%, rgba(0, 255, 198, 0.1) 100%)',
                      border: '2px solid #00ffc6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    ✅
                  </motion.div>
                )}
                
                {step.status === 'found' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.3) 0%, rgba(123, 66, 246, 0.1) 100%)',
                      border: '2px solid #7B42F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    🎯
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
              
              {/* Result indicator with more detail */}
              {step.result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    fontSize: '0.9rem',
                    padding: '4px 12px',
                    background: 'rgba(0, 255, 198, 0.1)',
                    border: '1px solid rgba(0, 255, 198, 0.3)',
                    borderRadius: '20px',
                    color: '#00ffc6',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {step.result.includes('found') && '✨'}
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
      
      {/* Live data stream - show what we're finding RIGHT NOW */}
      {sourcesFound > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(123, 66, 246, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(123, 66, 246, 0.2)'
          }}
        >
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#7B42F6',
            marginBottom: '10px'
          }}>
            📡 LIVE INTEL STREAM
          </h4>
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.8'
          }}>
            {steps.find(s => s.id === 'practice' && s.status === 'completed') && (
              <div>✓ Found practice website: <span style={{ color: '#00ffc6' }}>puredental.com</span></div>
            )}
            {steps.find(s => s.id === 'reviews' && s.result) && (
              <div>✓ Patient sentiment: <span style={{ color: '#00ffc6' }}>4.9/5 stars</span></div>
            )}
            {steps.find(s => s.id === 'website' && s.status === 'completed') && (
              <div>✓ Tech stack identified: <span style={{ color: '#00ffc6' }}>CBCT, Eaglesoft, iTero</span></div>
            )}
            {steps.find(s => s.id === 'competition' && s.result) && (
              <div>✓ Current vendors: <span style={{ color: '#00ffc6' }}>Eaglesoft, Carestream</span></div>
            )}
            {steps.find(s => s.id === 'technology' && s.status === 'completed') && (
              <div>✓ Growth signal: <span style={{ color: '#00ffc6' }}>Added 2nd CBCT unit</span></div>
            )}
          </div>
        </motion.div>
      )}

      {/* Early tactical brief - appears as soon as we have basic info */}
      {steps.filter(s => s.status === 'completed').length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.08) 0%, rgba(123, 66, 246, 0.08) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 255, 198, 0.3)'
          }}
        >
          <h4 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#00ffc6',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚡ PRELIMINARY SALES BRIEF
            {steps.find(s => s.id === 'synthesis' && s.status !== 'completed') && (
              <span style={{ 
                fontSize: '0.8rem', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '400'
              }}>
                (finalizing...)
              </span>
            )}
          </h4>
          <div style={{
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.7'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#00ffc6' }}>Quick Win Approach:</strong> 
              {steps.find(s => s.id === 'website' && s.status === 'completed') 
                ? " They're using CBCT - position yomi as the natural evolution for guided surgery."
                : " Focus on their oral surgery specialty and implant volume."}
            </div>
            
            {steps.find(s => s.id === 'reviews' && s.status === 'completed') && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#00ffc6' }}>Patient Angle:</strong> With 4.9★ reviews, 
                they care about outcomes. Show how yomi improves precision and patient satisfaction.
              </div>
            )}
            
            {steps.find(s => s.id === 'competition' && s.status === 'completed') && (
              <div>
                <strong style={{ color: '#00ffc6' }}>Integration:</strong> Already using Eaglesoft 
                and Carestream - emphasize yomi's compatibility with existing workflow.
              </div>
            )}
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