/**
 * DEEP INTELLIGENCE SCAN - Comprehensive website analysis and data extraction
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { deepIntelligenceGather } from '../lib/deepIntelligenceGatherer';
import { IntelligenceInterface } from './IntelligenceInterface';

interface Props {
  doctorName: string;
  location?: string;
  basicScanResults?: any;
  onComplete?: (results: any) => void;
}

export default function DeepIntelligenceScan({ 
  doctorName, 
  location, 
  basicScanResults,
  onComplete 
}: Props) {
  const [progress, setProgress] = useState(0);
  const [scanStage, setScanStage] = useState('Initializing Deep Scan...');
  const [intelligenceScore, setIntelligenceScore] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [foundWebsite, setFoundWebsite] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    async function runDeepScan() {
      try {
        // Phase 1: Analyze search results (0-15%)
        setScanStage('Analyzing Search Results...');
        setProgress(10);
        
        // Start deep intelligence gathering
        const deepResults = await deepIntelligenceGather(
          doctorName,
          location,
          basicScanResults
        );
        
        // Phase 2: Website discovery (15-30%)
        setTimeout(() => {
          if (!mounted) return;
          setScanStage('Discovering Practice Website...');
          setProgress(25);
          if (deepResults.website) {
            setFoundWebsite(deepResults.website);
          }
        }, 800);
        
        // Phase 3: Content extraction (30-50%)
        setTimeout(() => {
          if (!mounted) return;
          setScanStage(foundWebsite ? 'Extracting Website Content...' : 'Searching Multiple Sources...');
          setProgress(45);
        }, 1600);
        
        // Phase 4: Intelligence analysis (50-75%)
        setTimeout(() => {
          if (!mounted) return;
          setScanStage('Building Comprehensive Profile...');
          setProgress(70);
        }, 2400);
        
        // Phase 5: Final synthesis (75-100%)
        setTimeout(() => {
          if (!mounted) return;
          setScanStage('Finalizing Intelligence Report...');
          setProgress(90);
          
          // Calculate final score
          const score = deepResults.confidence || 75;
          setIntelligenceScore(score);
        }, 3200);
        
        // Complete scan
        setTimeout(() => {
          if (!mounted) return;
          setProgress(100);
          setScanStage('Deep Intelligence Complete');
          
          // Merge basic and deep results
          const finalResults = {
            ...basicScanResults,
            deep: deepResults,
            enhanced: {
              ...deepResults,
              stage: 'enhanced',
              doctor: doctorName,
              confidence: deepResults.confidence,
              summary: deepResults.summary,
              keyPoints: deepResults.keyPoints,
              website: deepResults.website,
              practiceInfo: deepResults.practiceInfo
            }
          };
          
          setTimeout(() => {
            if (!mounted) return;
            setIsScanning(false);
            onComplete?.(finalResults);
          }, 1000);
        }, 4000);
        
      } catch (error) {
        console.error('Deep scan error:', error);
        if (mounted) {
          // Fallback with basic results
          setIntelligenceScore(60);
          setScanStage('Intelligence Report Ready');
          setProgress(100);
          setIsScanning(false);
          onComplete?.(basicScanResults);
        }
      }
    }
    
    runDeepScan();
    
    return () => {
      mounted = false;
    };
  }, [doctorName, location, basicScanResults, onComplete]);
  
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
        style={{ marginBottom: 30 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00D4FF 0%, #00FFE1 50%, #00FFC6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          DEEP INTELLIGENCE SCAN
        </Typography>
        {foundWebsite && (
          <Typography
            variant="body2"
            sx={{
              color: '#00FFC6',
              textAlign: 'center',
              mt: 1
            }}
          >
            Found: {foundWebsite}
          </Typography>
        )}
      </motion.div>
      
      {/* Intelligence Interface */}
      <IntelligenceInterface
        score={intelligenceScore}
        isScanning={isScanning}
        scanStage={scanStage}
        progress={progress}
        onComplete={() => {}}
        fullScreen={true}
      />
      
      {/* Scanning for text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: 30 }}
      >
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Deep Analysis: {doctorName}
        </Typography>
      </motion.div>
    </Box>
  );
}