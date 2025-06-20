import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CanvasHomeDemoMode } from './CanvasHomeDemoMode';
import { getInstantResults } from '../lib/instantResults';
import { TargetSightIcon, ProductScanIcon, TacticalBriefIcon } from '../components/Icons';
// @ts-ignore
import EnhancedActionSuite from '../components/EnhancedActionSuite';
import ResearchPanel from '../components/ResearchPanel';
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience';
import { analyzeDoctor } from '../lib/intelligentAnalysis';
import { ManualDoctorForm } from '../components/ManualDoctorForm';
import DoctorVerification from '../components/DoctorVerification';
import type { Doctor } from '../components/DoctorAutocomplete';
import { IntelligenceGauge } from '../components/IntelligenceGauge';
import { unifiedCanvasResearch } from '../lib/unifiedCanvasResearch';
import type { ResearchData } from '../lib/webResearch';
import { IntelligenceProgress } from '../components/IntelligenceProgress';
import { MOCK_MODE } from '../lib/mockResearch';
import PowerPackModal from '../components/PowerPackModal';
import { generateInstantIntelligence, type InstantIntelligence } from '../lib/instantIntelligence';
import { LoadingOverlay } from '../components/LoadingStates';
import { sanitizeInput } from '../utils/errorHandling';
import SimpleCinematicScan from '../components/SimpleCinematicScan';

const CanvasHome: React.FC = () => {
  const { session } = useAuth();
  
  // Show demo mode by default for non-authenticated users
  if (!session) {
    return <CanvasHomeDemoMode />;
  }
  
  // For authenticated users, show the research panel
  return <IntegratedCanvasExperience />;
};

export default CanvasHome;