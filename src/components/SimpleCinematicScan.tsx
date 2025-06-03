/**
 * SIMPLE CINEMATIC SCAN - WORKS NOW, NO LOOPS
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { simpleFastScan } from '../lib/simpleFastScan';

interface Props {
  doctorName: string;
  location?: string;
  onComplete?: () => void;
}

export default function SimpleCinematicScan({ doctorName, location, onComplete }: Props) {
  // const [stage, setStage] = useState<'scanning' | 'results'>('scanning');
  const [scanData, setScanData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let mounted = true;
    
    async function runScan() {
      const results = await simpleFastScan(doctorName, location);
      
      if (!mounted) return;
      
      // Show instant results
      setScanData(results.instant);
      setProgress(25);
      
      // Show basic after 2 seconds
      setTimeout(() => {
        if (!mounted) return;
        setScanData(results.basic || results.instant);
        setProgress(60);
      }, 2000);
      
      // Show enhanced after 4 seconds
      setTimeout(() => {
        if (!mounted) return;
        setScanData(results.enhanced || results.basic || results.instant);
        setProgress(100);
        // setStage('results');
      }, 4000);
      
      // Complete after 6 seconds
      setTimeout(() => {
        if (!mounted) return;
        onComplete?.();
      }, 6000);
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
      {/* Scanning Animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ marginBottom: 40 }}
      >
        <Box sx={{
          width: 120,
          height: 120,
          border: '3px solid #00ffc6',
          borderRadius: '50%',
          borderTopColor: 'transparent',
          borderRightColor: 'transparent'
        }} />
      </motion.div>
      
      {/* Status Text */}
      <Typography variant="h4" sx={{ mb: 2 }}>
        {scanData?.summary || 'Initializing...'}
      </Typography>
      
      {/* Progress Bar */}
      <Box sx={{
        width: 400,
        height: 6,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 4
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            width: '0%'
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </Box>
      
      {/* Key Points */}
      {scanData?.keyPoints && (
        <Box sx={{ textAlign: 'center' }}>
          {scanData.keyPoints.map((point: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                {point}
              </Typography>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}