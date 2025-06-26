import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import RepSpheresSearchPanel from '../components/RepSpheresSearchPanel';
import SimpleCinematicScan from '../components/SimpleCinematicScan';
import SimpleProgressiveResults from '../components/SimpleProgressiveResults';
import EnhancedChatLauncher from '../components/EnhancedChatLauncher';
import { useAuth } from '../auth';
import { checkUserCredits, deductCredit } from '../lib/creditManager';

// Premium gradient background with RepSpheres styling
const PremiumBackground = styled(Box)`
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse at top left, rgba(159, 88, 250, 0.03) 0%, transparent 40%),
    radial-gradient(ellipse at bottom right, rgba(0, 255, 198, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 100%);
  z-index: -1;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 19px,
        rgba(255, 255, 255, 0.01) 20px
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        transparent 19px,
        rgba(255, 255, 255, 0.01) 20px
      );
    opacity: 0.5;
    pointer-events: none;
  }
`;

// Main container with proper spacing
const MainContainer = styled(Box)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 60px 40px;
  }
  
  @media (min-width: 1200px) {
    padding: 80px 60px;
  }
`;

const CanvasHomePremium: React.FC = () => {
  const [stage, setStage] = useState<'input' | 'scanning' | 'results'>('input');
  const [scanData, setScanData] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [creditError, setCreditError] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const loadCredits = async () => {
      if (user) {
        const creditCheck = await checkUserCredits(user.id);
        setCreditsRemaining(creditCheck.creditsRemaining);
      }
    };
    loadCredits();
  }, [user]);
  
  const handleScanStart = async (doctorName: string, product: string, location?: string) => {
    setScanData({ doctorName, product, location });
    
    // Allow non-authenticated users to try the scan
    if (!user) {
      setStage('scanning');
      return;
    }
    
    // For authenticated users, check credits
    const creditCheck = await checkUserCredits(user.id);
    setCreditsRemaining(creditCheck.creditsRemaining);
    
    if (!creditCheck.hasCredits) {
      setCreditError('You have no credits remaining. Please upgrade your plan to continue scanning.');
      return;
    }
    
    // Deduct credit and start scan
    const deducted = await deductCredit(user.id);
    if (!deducted) {
      setCreditError('Failed to process scan. Please try again.');
      return;
    }
    
    setCreditsRemaining(creditCheck.creditsRemaining - 1);
    setStage('scanning');
  };
  
  const handleScanComplete = (results: any) => {
    setScanResults(results);
    setStage('results');
  };
  
  const _handleNewScan = () => {
    setScanData(null);
    setScanResults(null);
    setStage('input');
  };
  
  return (
    <>
      <PremiumBackground />
      <MainContainer>
        {stage === 'input' && (
          <RepSpheresSearchPanel 
            onScanStart={handleScanStart}
            creditsRemaining={creditsRemaining}
            creditError={creditError}
          />
        )}
        
        {stage === 'scanning' && scanData && (
          <SimpleCinematicScan
            doctorName={scanData.doctorName}
            location={scanData.location}
            onComplete={handleScanComplete}
          />
        )}
        
        {stage === 'results' && scanResults && scanData && (
          <SimpleProgressiveResults
            doctorName={scanData.doctorName}
            userTier={user?.subscription?.tier || 'free'}
            onUpgradeClick={() => console.log('Upgrade clicked')}
            scanData={scanResults}
          />
        )}
      </MainContainer>
      
      {/* Enhanced Chat Launcher for AI Agents */}
      <EnhancedChatLauncher />
    </>
  );
};

export default CanvasHomePremium;