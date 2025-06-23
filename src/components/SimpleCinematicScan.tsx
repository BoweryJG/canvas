/**
 * REPSPHERES INTELLIGENCE SCAN - POWERED BY STUNNING GAUGE
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { simpleFastScan } from '../lib/simpleFastScan';
import { IntelligenceGauge } from './IntelligenceGauge';

interface Props {
  doctorName: string;
  location?: string;
  onComplete?: (results: any) => void;
}

export default function SimpleCinematicScan({ doctorName, location, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [scanStage, setScanStage] = useState('Initializing...');
  const [intelligenceScore, setIntelligenceScore] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    async function runScan() {
      // Phase 1: Initialize (0-10%)
      setScanStage('NPI Database Access');
      setProgress(5);
      
      // Start the actual scan
      const scanPromise = simpleFastScan(doctorName, location);
      
      // Phase 2: NPI Lookup (10-25%)
      setTimeout(() => {
        if (!mounted) return;
        setScanStage('Verifying Practice Information');
        setProgress(20);
      }, 800);
      
      // Phase 3: Practice Verification (25-50%)
      setTimeout(() => {
        if (!mounted) return;
        setScanStage('Analyzing Digital Footprint');
        setProgress(40);
      }, 1600);
      
      // Phase 4: Social Analysis (50-75%)
      setTimeout(() => {
        if (!mounted) return;
        setScanStage('Gathering Intelligence Data');
        setProgress(65);
      }, 2400);
      
      // Phase 5: Intelligence Synthesis (75-90%)
      setTimeout(() => {
        if (!mounted) return;
        setScanStage('Calculating Intelligence Score');
        setProgress(85);
      }, 3200);
      
      // Get actual results
      const results = await scanPromise;
      
      if (!mounted) return;
      
      // Phase 6: Finalizing (90-100%)
      setTimeout(() => {
        if (!mounted) return;
        
        // Calculate intelligence score based on confidence
        const score = results.enhanced?.confidence || results.basic?.confidence || 60;
        setIntelligenceScore(score);
        setScanStage('Intelligence Report Ready');
        setProgress(100);
        
        // Complete after showing 100%
        setTimeout(() => {
          if (!mounted) return;
          setIsScanning(false);
          onComplete?.(results);
        }, 1000);
      }, 4000);
    }
    
    runScan();
    
    return () => {
      mounted = false;
    };
  }, [doctorName, location]);
  
  return (
    <Box sx={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      color: '#fff',
      zIndex: 9999
    }}>
      {/* RepSpheres Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 40 }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            mb: 1
          }}
        >
          REPSPHERES
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}
        >
          Intelligence Scan
        </Typography>
      </motion.div>
      
      {/* Intelligence Gauge */}
      <IntelligenceGauge
        score={intelligenceScore}
        isScanning={isScanning}
        scanStage={scanStage}
        progress={progress}
        onComplete={() => {}}
        fullScreen={true}
      />
      
      {/* Doctor Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: 40 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'center',
            color: 'rgba(255,255,255,0.9)',
            mb: 1
          }}
        >
          Dr. {doctorName}
        </Typography>
        {location && (
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)'
            }}
          >
            {location}
          </Typography>
        )}
      </motion.div>
    </Box>
  );
}