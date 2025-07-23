import React from 'react';
import { motion } from 'framer-motion';

interface DataStreamPanelProps {
  progress: number;
  scanStage: string;
}

const DataStreamPanel: React.FC<DataStreamPanelProps> = () => {
  const dataStreams = [
    { id: 'npi', label: 'NPI Registry', color: '#00D4FF', delay: 0 },
    { id: 'practice', label: 'Practice Info', color: '#00FFE1', delay: 0.5 },
    { id: 'digital', label: 'Digital Footprint', color: '#00FFC6', delay: 1.0 },
    { id: 'reviews', label: 'Patient Data', color: '#00FF88', delay: 1.5 }
  ];

  return (
    <motion.div 
      className="data-stream-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="stream-header">
        <h3>DATA ACQUISITION</h3>
        <p>Accessing medical intelligence sources...</p>
      </div>

      <div className="stream-grid">
        {dataStreams.map((stream) => (
          <motion.div
            key={stream.id}
            className="stream-source"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: stream.delay, duration: 0.6 }}
          >
            <div className="source-icon" style={{ backgroundColor: stream.color }}>
              <div className="icon-glow" style={{ backgroundColor: stream.color }} />
            </div>
            
            <div className="source-info">
              <div className="source-label">{stream.label}</div>
              <div className="source-status">CONNECTED</div>
            </div>

            {/* Data particles flowing */}
            <div className="data-flow">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="data-particle"
                  style={{ backgroundColor: stream.color }}
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ 
                    x: [0, 200, 400],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: stream.delay + (i * 0.2),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Central collection point */}
      <motion.div
        className="data-collector"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <div className="collector-core">
          <motion.div 
            className="pulse-ring"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="collector-icon">📊</div>
        </div>
        <div className="collector-label">AGGREGATING</div>
      </motion.div>
    </motion.div>
  );
};

export default DataStreamPanel;