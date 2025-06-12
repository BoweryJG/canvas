import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataManager } from '../../utils/dataManager';
import { analytics } from '../../utils/analytics';
import './OnboardingFlow.css';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: {
    label: string;
    handler: () => void;
  };
  skipLabel?: string;
}

const OnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Canvas',
    description: 'Your intelligent sales companion for healthcare',
    content: (
      <div className="onboarding-welcome">
        <div className="onboarding-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" />
            <path d="M40 20 L40 50 M25 35 L55 35" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p>Canvas helps you identify and connect with the right healthcare providers for your products.</p>
      </div>
    )
  },
  {
    id: 'scan',
    title: 'Smart Scanning',
    description: 'Find your ideal customers instantly',
    content: (
      <div className="onboarding-feature">
        <div className="feature-demo">
          <div className="demo-gauge">
            <div className="demo-gauge-fill" />
          </div>
        </div>
        <ul className="feature-list">
          <li>Enter a doctor's name or NPI</li>
          <li>Get instant intelligence scoring</li>
          <li>Access deep research insights</li>
        </ul>
      </div>
    )
  },
  {
    id: 'research',
    title: 'Deep Research',
    description: 'Comprehensive insights at your fingertips',
    content: (
      <div className="onboarding-feature">
        <div className="research-tabs">
          <div className="tab-demo">Practice Info</div>
          <div className="tab-demo">Procedures</div>
          <div className="tab-demo">Technology</div>
          <div className="tab-demo">Research</div>
        </div>
        <p>Get detailed information about practice specialties, procedures, technology adoption, and more.</p>
      </div>
    )
  },
  {
    id: 'mobile',
    title: 'Work Anywhere',
    description: 'Optimized for mobile and offline use',
    content: (
      <div className="onboarding-feature">
        <div className="mobile-features">
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Mobile optimized</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span>Offline support</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Lightning fast</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'setup',
    title: 'Quick Setup',
    description: 'Let\'s personalize your experience',
    content: (
      <div className="onboarding-setup">
        <form className="setup-form">
          <div className="form-group">
            <label>Your Role</label>
            <select defaultValue="">
              <option value="" disabled>Select your role</option>
              <option value="sales">Sales Representative</option>
              <option value="manager">Sales Manager</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Primary Product Category</label>
            <select defaultValue="">
              <option value="" disabled>Select category</option>
              <option value="devices">Medical Devices</option>
              <option value="pharma">Pharmaceuticals</option>
              <option value="software">Healthcare Software</option>
              <option value="services">Healthcare Services</option>
            </select>
          </div>
        </form>
      </div>
    ),
    action: {
      label: 'Get Started',
      handler: () => {
        analytics.track('onboarding', 'completed');
      }
    }
  }
];

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if user has seen onboarding
    const seen = DataManager.load<boolean>('onboarding_completed');
    if (seen) {
      setHasSeenOnboarding(true);
      onComplete();
    } else {
      analytics.track('onboarding', 'started');
    }
  }, [onComplete]);
  
  const handleNext = () => {
    const step = OnboardingSteps[currentStep];
    analytics.track('onboarding', 'step_completed', step.id);
    
    if (currentStep < OnboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const handleSkip = () => {
    analytics.track('onboarding', 'skipped', OnboardingSteps[currentStep].id);
    completeOnboarding();
  };
  
  const completeOnboarding = () => {
    DataManager.save('onboarding_completed', true);
    setHasSeenOnboarding(true);
    onComplete();
  };
  
  if (hasSeenOnboarding) {
    return null;
  }
  
  const step = OnboardingSteps[currentStep];
  const progress = ((currentStep + 1) / OnboardingSteps.length) * 100;
  
  return (
    <div className="onboarding-overlay">
      <motion.div 
        className="onboarding-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="onboarding-progress">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="onboarding-content"
          >
            <h2>{step.title}</h2>
            <p className="step-description">{step.description}</p>
            
            <div className="step-content">
              {step.content}
            </div>
            
            <div className="onboarding-actions">
              {currentStep > 0 && (
                <button 
                  className="btn-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </button>
              )}
              
              <div className="actions-right">
                {currentStep < OnboardingSteps.length - 1 && (
                  <button 
                    className="btn-text"
                    onClick={handleSkip}
                  >
                    {step.skipLabel || 'Skip'}
                  </button>
                )}
                
                {step.action ? (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      step.action!.handler();
                      handleNext();
                    }}
                  >
                    {step.action.label}
                  </button>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={handleNext}
                  >
                    {currentStep === OnboardingSteps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="step-indicators">
          {OnboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => index <= currentStep && setCurrentStep(index)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};