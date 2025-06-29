import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataStreamPanel from './DataStreamPanel';
import CategoryDisplay from './CategoryDisplay';
import IntelligenceBuilder from './IntelligenceBuilder';
import './interface.css';

interface IntelligenceInterfaceProps {
  score: number;
  isScanning: boolean;
  scanStage?: string;
  progress?: number;
  onComplete?: () => void;
  fullScreen?: boolean;
  onTap?: () => void;
}

export const IntelligenceInterface: React.FC<IntelligenceInterfaceProps> = ({
  score,
  isScanning,
  scanStage = '',
  progress = 0,
  onComplete,
  fullScreen = false,
  onTap
}) => {
  const [phase, setPhase] = useState<'idle' | 'acquiring' | 'categorizing' | 'synthesizing' | 'complete'>('idle');
  const [displayProgress, setDisplayProgress] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);

  // Smooth progress animation
  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  // Phase management based on progress
  useEffect(() => {
    if (isScanning) {
      if (progress < 25) {
        setPhase('acquiring');
      } else if (progress < 75) {
        setPhase('categorizing');
        // Add categories as we progress
        const categoryList = [
          'Medical Credentials',
          'Practice Information', 
          'Digital Presence',
          'Patient Reviews',
          'Professional Network',
          'Specializations'
        ];
        const currentCategories = categoryList.slice(0, Math.floor((progress - 25) / 8.33) + 1);
        setCategories(currentCategories);
      } else if (progress < 100) {
        setPhase('synthesizing');
      } else {
        setPhase('complete');
        onComplete?.();
      }
    } else {
      setPhase('idle');
      setDisplayProgress(0);
      setCategories([]);
    }
  }, [isScanning, progress, onComplete]);

  return (
    <div 
      className={`intelligence-interface-container ${fullScreen ? 'full-screen' : ''} ${phase !== 'idle' ? 'active' : ''}`}
      onClick={onTap}
    >
      <motion.div 
        className="intelligence-interface"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Interface Header */}
        <motion.div 
          className="interface-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="status-line">
            <span className="system-label">REPSPHERES INTELLIGENCE</span>
            <span className="progress-indicator">{Math.round(displayProgress)}%</span>
          </div>
          <div className="scan-stage-display">
            {scanStage || 'SYSTEM READY'}
          </div>
        </motion.div>

        {/* Main Interface Body */}
        <div className="interface-body">
          
          {/* Data Acquisition Phase */}
          <AnimatePresence>
            {phase === 'acquiring' && (
              <DataStreamPanel 
                progress={displayProgress}
                scanStage={scanStage}
              />
            )}
          </AnimatePresence>

          {/* Category Organization Phase */}
          <AnimatePresence>
            {phase === 'categorizing' && (
              <CategoryDisplay 
                categories={categories}
                progress={displayProgress}
                scanStage={scanStage}
              />
            )}
          </AnimatePresence>

          {/* Intelligence Synthesis Phase */}
          <AnimatePresence>
            {(phase === 'synthesizing' || phase === 'complete') && (
              <IntelligenceBuilder 
                score={score}
                progress={displayProgress}
                phase={phase}
                categories={categories}
              />
            )}
          </AnimatePresence>

          {/* Idle State */}
          <AnimatePresence>
            {phase === 'idle' && (
              <motion.div 
                className="idle-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="idle-icon">⚡</div>
                <div className="idle-text">INTELLIGENCE SYSTEM READY</div>
                <div className="idle-subtext">Awaiting scan initialization...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interface Footer */}
        <motion.div 
          className="interface-footer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="progress-bar-container">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="system-status">
            {phase === 'complete' ? 'INTELLIGENCE REPORT READY' : 'PROCESSING...'}
          </div>
        </motion.div>

        {/* Background Grid Pattern */}
        <div className="interface-grid" />
        
        {/* Corner Decorations */}
        <div className="corner-decorations">
          <div className="corner top-left" />
          <div className="corner top-right" />
          <div className="corner bottom-left" />
          <div className="corner bottom-right" />
        </div>
      </motion.div>
    </div>
  );
};