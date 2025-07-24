/**
 * Cinematic Scan Experience - A category-defining UI/UX
 * Combines dramatic visual storytelling with progressive data loading
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Box, Typography, Button } from '@mui/material';
import { 
  Fingerprint, 
  Psychology,
  Timeline,
  AutoAwesome,
  Diamond,
  Lock,
  RocketLaunch
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { realTimeScanner, type RealTimeScanResult } from '../lib/realTimeFastScanner';
import { useAuth } from '../auth';

// Keyframe animations
const matrixRain = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;


const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 198, 0.5); }
  50% { box-shadow: 0 0 40px rgba(0, 255, 198, 0.8), 0 0 60px rgba(123, 66, 246, 0.6); }
`;

// Styled components
const DataStreamWindow = styled(Box)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: 150px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #00ffc6;
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 255, 198, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(180deg, #00ffc6 0%, transparent 100%);
    opacity: 0.1;
  }
`;

const MatrixChar = styled('span', {
  shouldForwardProp: (prop) => !['duration', 'delay'].includes(prop as string),
})<{ duration: number; delay: number }>`
  position: absolute;
  color: #00ffc6;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  animation: ${matrixRain} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  text-shadow: 0 0 5px currentColor;
`;

const WritingDesk = styled(Box)`
  position: relative;
  width: 90vw;
  max-width: 1200px;
  height: 70vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 0 100px rgba(123, 66, 246, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00ffc6, #7B42F6, #00ffc6);
    border-radius: 20px;
    z-index: -1;
    animation: ${glowPulse} 3s ease-in-out infinite;
  }
`;

const ReportPaper = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%);
  border-radius: 4px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 2px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 40px;
    bottom: 0;
    width: 1px;
    background: #ffcccc;
  }
`;


interface Props {
  doctorName: string;
  location?: string;
  onComplete?: (data: Record<string, unknown>) => void;
}

export default function CinematicScanExperience({ doctorName, location }: Props) {
  const [stage, setStage] = useState<'scanning' | 'revealing' | 'reading' | 'upsell'>('scanning');
  const [scanResult, setScanResult] = useState<RealTimeScanResult | null>(null);
  const [dataStream, setDataStream] = useState<string[]>([]);
  const [reportLines, setReportLines] = useState<string[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);
  const deskRef = useRef<HTMLDivElement>(null);
  const { subscription } = useAuth();
  
  // Spring animations
  const scanProgress = useSpring(0);
  const deskScale = useSpring(0);
  const paperY = useSpring(-1000);
  
  // Matrix rain characters
  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  const startScan = useCallback(() => {
    // Subscribe to scan results
    realTimeScanner.on('result', handleScanResult);
    
    // Start scanning with real data
    const userId = subscription?.tier ? 'user' : 'anonymous';
    realTimeScanner.scan(doctorName, location, userId);
    
    // Simulate data stream
    const streamInterval = setInterval(() => {
      const newData = generateDataStreamLine();
      setDataStream(prev => [...prev.slice(-10), newData]);
    }, 100);
    
    // Cleanup
    return () => {
      clearInterval(streamInterval);
      realTimeScanner.removeListener('result', handleScanResult);
      realTimeScanner.stop();
    };
  }, [doctorName, location, subscription?.tier]);

  useEffect(() => {
    // Start the cinematic experience
    startScan();
  }, [startScan]);
  
  const handleScanResult = (result: RealTimeScanResult) => {
    setScanResult(result);
    scanProgress.set(result.confidence);
    
    if (result.stage === 'enhanced') {
      // Trigger the dramatic reveal
      setTimeout(() => revealReport(result), 1000);
    }
  };
  
  const revealReport = (result: RealTimeScanResult) => {
    setStage('revealing');
    
    // Animate desk appearance
    deskScale.set(1);
    
    // Prepare report content
    const report = generateReportContent(result);
    
    // Animate paper falling
    setTimeout(() => {
      paperY.set(0);
      setStage('reading');
      
      // Typewriter effect for report
      animateReportText(report);
    }, 1000);
    
    // Show upsell after reading time
    setTimeout(() => {
      setShowUpsell(true);
      setStage('upsell');
    }, 8000);
  };
  
  const animateReportText = (lines: string[]) => {
    lines.forEach((line, index) => {
      setTimeout(() => {
        setReportLines(prev => [...prev, line]);
      }, index * 500);
    });
  };
  
  const generateDataStreamLine = () => {
    const elements = [
      `SCAN::${Math.random().toString(36).substr(2, 9)}`,
      `MED_ID::${Math.floor(Math.random() * 999999)}`,
      `MATCH::${(Math.random() * 100).toFixed(1)}%`,
      `INTEL::GATHERING`,
      `API::BRAVE_SEARCH`,
      `SCRAPE::HEALTHGRADES`,
      `ANALYZE::PATTERNS`,
      `BUILD::PROFILE`,
      `SCORE::CALCULATING`,
      `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}`
    ];
    return elements[Math.floor(Math.random() * elements.length)];
  };
  
  const generateReportContent = (result: RealTimeScanResult): string[] => {
    return [
      `CONFIDENTIAL INTELLIGENCE REPORT`,
      `Subject: Dr. ${result.doctorName}`,
      `Confidence Score: ${result.confidence}%`,
      ``,
      `KEY FINDINGS:`,
      ...result.keyPoints,
      ``,
      `RECOMMENDATION: High-value target identified.`,
      `Immediate outreach advised.`
    ];
  };
  
  const renderScanningStage = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="scanning-container"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0a0a0f 0%, #000000 100%)',
        zIndex: 100
      }}
    >
      {/* Central Scanner */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Fingerprint sx={{ fontSize: 120, color: '#00ffc6', opacity: 0.8 }} />
        </motion.div>
        
        {/* Scan rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            style={{
              position: 'absolute',
              inset: -ring * 30,
              border: '1px solid #00ffc6',
              borderRadius: '50%',
              opacity: 0.3
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              delay: ring * 0.3,
              repeat: Infinity
            }}
          />
        ))}
      </Box>
      
      {/* Progress Text */}
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#fff',
          fontWeight: 300,
          letterSpacing: '0.2em',
          mb: 2
        }}
      >
        {scanResult?.summary || 'INITIALIZING SCAN'}
      </Typography>
      
      {/* Progress Bar */}
      <Box sx={{ 
        width: '300px',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        mb: 4
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            width: `${scanResult?.confidence || 0}%`
          }}
          animate={{ width: `${scanResult?.confidence || 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </Box>
      
      {/* Data Stream Window */}
      <DataStreamWindow>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#00ffc6',
            fontFamily: 'monospace',
            p: 1,
            borderBottom: '1px solid rgba(0,255,198,0.3)'
          }}
        >
          DATA STREAM // LIVE
        </Typography>
        
        <Box sx={{ p: 1, fontFamily: 'monospace', fontSize: '10px' }}>
          {dataStream.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: '#00ffc6', marginBottom: '2px' }}
            >
              {line}
            </motion.div>
          ))}
        </Box>
        
        {/* Matrix rain effect */}
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.1 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <MatrixChar
              key={i}
              duration={Math.random() * 3 + 2}
              delay={Math.random() * 2}
              style={{ left: `${i * 15}px` }}
            >
              {matrixChars[Math.floor(Math.random() * matrixChars.length)]}
            </MatrixChar>
          ))}
        </Box>
      </DataStreamWindow>
    </motion.div>
  );
  
  const renderRevealStage = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f1e 100%)',
        zIndex: 99
      }}
    >
      <motion.div
        animate={{ scale: deskScale.get() }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <WritingDesk ref={deskRef}>
          {/* Desk surface texture */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            background: 'url("/wood-texture.png") center/cover',
            mixBlendMode: 'overlay'
          }} />
          
          {/* Report Paper */}
          <AnimatePresence>
            {stage === 'reading' && (
              <ReportPaper
                initial={{ y: -1000, rotate: -5 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 100
                }}
              >
                <Box sx={{ p: 4, color: '#1a1a1a' }}>
                  {reportLines.map((line, i) => (
                    <Typography
                      key={i}
                      variant={i === 0 ? 'h5' : 'body1'}
                      sx={{
                        fontFamily: i === 0 ? 'serif' : 'monospace',
                        fontWeight: i === 0 ? 700 : 400,
                        mb: 1,
                        overflow: 'hidden',
                        animation: `${typewriter} 1s steps(${line.length}) forwards`,
                        animationDelay: `${i * 0.5}s`,
                        opacity: 0,
                        animationFillMode: 'forwards'
                      }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
                
                {/* Paper shadow */}
                <Box sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: '10%',
                  right: '10%',
                  height: 20,
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
                  filter: 'blur(10px)'
                }} />
              </ReportPaper>
            )}
          </AnimatePresence>
          
          {/* Desk items for ambiance */}
          <Box sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 60,
            height: 60,
            background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 30px rgba(255,215,0,0.5)',
            opacity: 0.3
          }} />
        </WritingDesk>
      </motion.div>
    </motion.div>
  );
  
  const renderUpsellStage = () => (
    <AnimatePresence>
      {showUpsell && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 101
          }}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '600px',
              border: '2px solid #00ffc6',
              boxShadow: '0 0 50px rgba(0,255,198,0.3)'
            }}
          >
            <Typography variant="h3" sx={{ 
              color: '#fff',
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
              background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              UNLOCK FULL POWER
            </Typography>
            
            <Typography variant="h6" sx={{ color: '#fff', mb: 4, textAlign: 'center', opacity: 0.9 }}>
              Your initial scan revealed high-value intelligence. 
              Unlock the complete arsenal:
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
              {[
                { icon: <Psychology />, title: 'Deep Psychological Profile', time: '2 min', tier: 'pro' },
                { icon: <Timeline />, title: 'Predictive Outreach Timing', time: '3 min', tier: 'pro' },
                { icon: <AutoAwesome />, title: 'AI-Powered Campaign', time: '5 min', tier: 'genius' },
                { icon: <Diamond />, title: 'Competitive Intelligence', time: 'instant', tier: 'enterprise' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      borderColor: '#00ffc6',
                      transform: 'translateX(5px)'
                    }
                  }}>
                    <Box sx={{ color: '#00ffc6' }}>{feature.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00ffc6' }}>
                        Ready in {feature.time}
                      </Typography>
                    </Box>
                    {subscription?.tier !== feature.tier && (
                      <Lock sx={{ color: '#666', fontSize: 20 }} />
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<RocketLaunch />}
                sx={{
                  background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 30px rgba(0,255,198,0.5)'
                  }
                }}
                onClick={() => {
                  // Handle upgrade
                  console.log('Upgrade clicked');
                }}
              >
                UPGRADE NOW
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#00ffc6',
                  color: '#00ffc6',
                  '&:hover': {
                    background: 'rgba(0,255,198,0.1)',
                    borderColor: '#00ffc6'
                  }
                }}
                onClick={() => setShowUpsell(false)}
              >
                Continue with Basic
              </Button>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return (
    <>
      {stage === 'scanning' && renderScanningStage()}
      {(stage === 'revealing' || stage === 'reading') && renderRevealStage()}
      {renderUpsellStage()}
    </>
  );
}