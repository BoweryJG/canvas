import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import RepSpheresSearchPanel from '../components/RepSpheresSearchPanel';
import SimpleCinematicScan from '../components/SimpleCinematicScan';
import EnhancedActionSuite from '../components/EnhancedActionSuite';
import EnhancedChatLauncher from '../components/EnhancedChatLauncher';
import { useAuth } from '../auth/AuthContext';
import { checkUserCredits } from '../lib/creditManager';

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
  console.log('CanvasHomePremium: Component starting to render');
  
  const [stage, setStage] = useState<'input' | 'scanning-basic' | 'scanning-deep' | 'campaigns'>('input');
  const [scanData, setScanData] = useState<any>(null);
  const [deepScanResults, setDeepScanResults] = useState<any>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [creditError] = useState('');
  
  console.log('CanvasHomePremium: About to call useAuth');
  const { user } = useAuth();
  console.log('CanvasHomePremium: useAuth called successfully, user:', user);
  
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
    
    // Both scan stages are free for everyone to impress users
    setStage('scanning-basic');
  };
  
  const handleBasicScanComplete = (results: any) => {
    console.log('handleBasicScanComplete called with results:', results);
    
    // Transform the results to match expected structure
    const transformedResults = {
      doctor: {
        name: results.basic?.doctor || results.enhanced?.doctor || 'Unknown Doctor',
        npi: results.basic?.npi,
        specialty: results.basic?.specialty,
        practice: results.basic?.practice,
        location: results.basic?.location,
        phone: results.basic?.phone,
        email: results.basic?.email,
        verified: true
      },
      confidence: results.enhanced?.confidence || results.basic?.confidence || 50,
      intelligence: {
        score: results.enhanced?.confidence || results.basic?.confidence || 50,
        insights: results.enhanced?.keyPoints || results.basic?.keyPoints || []
      },
      basic: results.basic
    };
    
    console.log('handleBasicScanComplete: Transformed results:', transformedResults);
    setDeepScanResults(results);
    
    // Skip ALL scanning stages - go DIRECTLY to campaigns
    console.log('handleBasicScanComplete: SKIPPING ALL SCANS - going DIRECTLY to campaigns');
    setStage('campaigns');
  };
  
  
  
  const handleDeepScanComplete = (results: any) => {
    console.log('handleDeepScanComplete called with results:', results);
    console.log('handleDeepScanComplete: results.research:', results?.research);
    console.log('handleDeepScanComplete: results.instantIntel:', results?.instantIntel);
    console.log('handleDeepScanComplete: results.instant:', results?.instant);
    console.log('handleDeepScanComplete: Object.keys(results):', Object.keys(results || {}));
    setDeepScanResults(results);
    setStage('campaigns');
    console.log('handleDeepScanComplete: Set stage to campaigns');
  };
  
  
  console.log('CanvasHomePremium: About to render, stage:', stage);
  console.log('CanvasHomePremium: creditsRemaining:', creditsRemaining);
  console.log('CanvasHomePremium: deepScanResults:', deepScanResults);
  console.log('CanvasHomePremium: scanData:', scanData);
  
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
        
        {stage === 'scanning-basic' && scanData && (
          <SimpleCinematicScan
            doctorName={scanData.doctorName}
            location={scanData.location}
            onComplete={handleBasicScanComplete}
          />
        )}
        
        
        {stage === 'scanning-deep' && scanData && (
          <SimpleCinematicScan
            doctorName={scanData.doctorName}
            location={scanData.location}
            onComplete={handleDeepScanComplete}
          />
        )}
        
        {stage === 'campaigns' && (
          <Box sx={{
            minHeight: '100vh',
            pt: 10,
            pb: 4,
            px: 2,
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
          }}>
            <EnhancedActionSuite
              scanResult={deepScanResults || { doctor: scanData?.doctorName || deepScanResults?.enhanced?.doctor || deepScanResults?.basic?.doctor || 'Unknown Doctor', confidence: 50, summary: 'Scan completed successfully' }}
              researchData={deepScanResults || { practiceInfo: {}, marketInsights: {} }}
              instantIntel={deepScanResults?.instant || deepScanResults || { outreachTemplates: { email: { subject: '', body: '' } } }}
            />
          </Box>
        )}
      </MainContainer>
      
      {/* Enhanced Chat Launcher for AI Agents */}
      <EnhancedChatLauncher />
    </>
  );
};

export default CanvasHomePremium;