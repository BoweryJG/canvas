import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataStreamWindowProps {
  isActive: boolean;
  scanStage: string;
}

const DataStreamWindow: React.FC<DataStreamWindowProps> = ({ isActive, scanStage }) => {
  // Sample data snippets that will fly by
  const dataSnippets = [
    { type: 'binary', content: '01101000 01100101 01101100' },
    { type: 'binary', content: '11010010 10110101 00101110' },
    { type: 'news', content: 'Dr. White receives excellence award...' },
    { type: 'review', content: '★★★★★ "Best oral surgeon in Buffalo"' },
    { type: 'data', content: 'NPI: 1154764793 • Verified ✓' },
    { type: 'tech', content: 'CBCT Scanner • Digital Workflow' },
    { type: 'binary', content: '10011101 11110000 01010101' },
    { type: 'news', content: 'Williamsville practice expands...' },
    { type: 'review', content: '4.9/5.0 rating • 127 reviews' },
    { type: 'data', content: 'Specialty: Oral Surgery' },
    { type: 'binary', content: '00110011 10101010 11001100' },
    { type: 'insight', content: 'High-value practice detected' },
  ];

  return (
    <div className="data-stream-window">
      <AnimatePresence>
        {isActive && (
          <>
            {/* Data visualization layer */}
            <div className="data-viz-layer">
              {/* Flying data snippets */}
              {dataSnippets.map((snippet, index) => (
                <motion.div
                  key={`snippet-${index}`}
                  className={`data-snippet ${snippet.type}`}
                  initial={{ 
                    x: Math.random() * 200 - 100,
                    y: 150,
                    opacity: 0,
                    scale: 0.8
                  }}
                  animate={{
                    x: Math.random() * 200 - 100,
                    y: -150,
                    opacity: [0, 1, 1, 0],
                    scale: [0.8, 1, 1, 0.8]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: index * 0.3,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                  style={{
                    position: 'absolute',
                    fontSize: snippet.type === 'binary' ? '10px' : '11px',
                    fontFamily: snippet.type === 'binary' ? 'monospace' : 'inherit',
                    color: snippet.type === 'binary' ? '#00ffc6' : 
                           snippet.type === 'news' ? '#7B42F6' :
                           snippet.type === 'review' ? '#ffcc00' :
                           snippet.type === 'data' ? '#00d4ff' :
                           snippet.type === 'tech' ? '#ff00ff' :
                           '#00ffc6',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 10px currentColor',
                    pointerEvents: 'none',
                    opacity: 0.8,
                    filter: 'blur(0.5px)'
                  }}
                >
                  {snippet.content}
                </motion.div>
              ))}

              {/* Matrix rain effect */}
              <div className="matrix-rain">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`matrix-${i}`}
                    className="matrix-column"
                    initial={{ y: -200 }}
                    animate={{ y: 200 }}
                    transition={{
                      duration: 4,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      position: 'absolute',
                      left: `${10 + i * 12}%`,
                      opacity: 0.2,
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#00ffc6',
                      lineHeight: '14px',
                      pointerEvents: 'none'
                    }}
                  >
                    {'01\n10\n11\n00\n01\n11\n10\n00\n11\n01'}
                  </motion.div>
                ))}
              </div>

              {/* Scanning line effect */}
              <motion.div
                className="scan-line-data"
                animate={{
                  y: [-100, 100],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  width: '80%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #00ffc6, transparent)',
                  left: '10%',
                  filter: 'blur(1px)',
                  pointerEvents: 'none'
                }}
              />

              {/* Current stage indicator */}
              <motion.div
                className="stage-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  color: '#7B42F6',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: '600',
                  textShadow: '0 0 20px rgba(123, 66, 246, 0.8)',
                  pointerEvents: 'none'
                }}
              >
                {scanStage}
              </motion.div>
            </div>

            {/* Glowing edges effect */}
            <div className="window-glow" 
                 style={{
                   position: 'absolute',
                   inset: '30px',
                   borderRadius: '50%',
                   background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 255, 198, 0.1) 60%, transparent 80%)',
                   pointerEvents: 'none',
                   animation: 'pulse 2s ease-in-out infinite'
                 }} />
          </>
        )}
      </AnimatePresence>

      <style>{`
        .data-stream-window {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 50%;
          mask-image: radial-gradient(circle at center, black 40%, transparent 70%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 70%);
        }

        .data-viz-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default DataStreamWindow;