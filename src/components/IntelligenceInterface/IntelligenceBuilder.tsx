import React from 'react';
import { motion } from 'framer-motion';

interface IntelligenceBuilderProps {
  score: number;
  progress: number;
  phase: 'synthesizing' | 'complete';
  categories: string[];
}

const IntelligenceBuilder: React.FC<IntelligenceBuilderProps> = ({ 
  score, 
  progress, 
  phase,
  categories 
}) => {
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'CRITICAL', color: '#00FF88' };
    if (score >= 80) return { level: 'HIGH-VALUE', color: '#00FFC6' };
    if (score >= 60) return { level: 'PROMISING', color: '#00FFE1' };
    return { level: 'DEVELOPING', color: '#00D4FF' };
  };

  const scoreLevel = getScoreLevel(score);

  return (
    <motion.div 
      className="intelligence-builder"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="builder-header">
        <h3>INTELLIGENCE SYNTHESIS</h3>
        <p>Compiling comprehensive medical practice intelligence report...</p>
      </div>

      <div className="synthesis-display">
        
        {/* Category summary */}
        <div className="category-summary">
          <div className="summary-label">ANALYZED CATEGORIES</div>
          <div className="category-tags">
            {categories.map((category, index) => (
              <motion.span
                key={category}
                className="category-tag"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {category}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Intelligence score builder */}
        <div className="score-builder">
          <div className="score-container">
            <motion.div 
              className="score-display"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <motion.span 
                className="score-number"
                style={{ color: scoreLevel.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {phase === 'complete' ? score : Math.round(progress)}
              </motion.span>
              <span className="score-percent">%</span>
            </motion.div>
            
            <motion.div 
              className="score-level"
              style={{ color: scoreLevel.color }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              {scoreLevel.level}
            </motion.div>
          </div>

          {/* Score building animation */}
          <div className="score-visualization">
            <div className="score-bars">
              {Array.from({ length: 10 }, (_, i) => (
                <motion.div
                  key={i}
                  className="score-bar"
                  initial={{ height: 0 }}
                  animate={{ 
                    height: score > (i + 1) * 10 ? '100%' : '0%',
                    backgroundColor: score > (i + 1) * 10 ? scoreLevel.color : '#1a4a6a'
                  }}
                  transition={{ 
                    delay: 0.8 + i * 0.1,
                    duration: 0.5 
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence metrics */}
        <div className="intelligence-metrics">
          <div className="metric">
            <div className="metric-label">DATA SOURCES</div>
            <motion.div 
              className="metric-value"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {categories.length}
            </motion.div>
          </div>
          
          <div className="metric">
            <div className="metric-label">CONFIDENCE</div>
            <motion.div 
              className="metric-value"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              {score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW'}
            </motion.div>
          </div>
          
          <div className="metric">
            <div className="metric-label">STATUS</div>
            <motion.div 
              className="metric-value"
              style={{ color: phase === 'complete' ? '#00FF88' : '#00FFE1' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {phase === 'complete' ? 'READY' : 'BUILDING'}
            </motion.div>
          </div>
        </div>

        {/* Completion indicator */}
        {phase === 'complete' && (
          <motion.div
            className="completion-indicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
          >
            <div className="completion-icon">🎯</div>
            <div className="completion-text">INTELLIGENCE REPORT COMPLETE</div>
            <div className="completion-subtext">Medical practice analysis ready for review</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default IntelligenceBuilder;