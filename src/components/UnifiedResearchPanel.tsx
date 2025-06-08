import React, { useState, useEffect } from 'react';
import { EnhancedResearchPanelWithRender } from './EnhancedResearchPanelWithRender';
import { EnhancedResearchPanel } from './EnhancedResearchPanel';
import { UnifiedEnhancedResearchPanel } from './UnifiedEnhancedResearchPanel';
import { BackendToggle } from './BackendToggle';
import { checkBackendHealth } from '../lib/renderBackendAPI';

export const UnifiedResearchPanel: React.FC = () => {
  const [useRenderBackend, setUseRenderBackend] = useState(() => {
    // Check localStorage for preference
    const saved = localStorage.getItem('preferRenderBackend');
    return saved === 'true';
  });
  
  const [useAdaptiveAI] = useState(() => {
    // Check for adaptive AI preference (defaults to true)
    const saved = localStorage.getItem('useAdaptiveAI');
    return saved !== 'false'; // Default to true
  });
  
  const [renderHealthy, setRenderHealthy] = useState(true);

  useEffect(() => {
    // Check Render backend health
    checkBackendHealth().then(setRenderHealthy);
    
    // Recheck every 30 seconds
    const interval = setInterval(() => {
      checkBackendHealth().then(setRenderHealthy);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBackendToggle = (useRender: boolean) => {
    setUseRenderBackend(useRender);
    localStorage.setItem('preferRenderBackend', String(useRender));
  };

  // Determine which panel to show
  if (useAdaptiveAI) {
    // Use the new unified panel with Sequential Thinking
    return (
      <>
        <UnifiedEnhancedResearchPanel />
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm">
          🧠 Using Adaptive AI with Sequential Thinking
        </div>
      </>
    );
  }

  // Legacy mode
  return (
    <>
      {useRenderBackend && renderHealthy ? (
        <EnhancedResearchPanelWithRender />
      ) : (
        <EnhancedResearchPanel />
      )}
      
      <BackendToggle 
        useRenderBackend={useRenderBackend}
        onToggle={handleBackendToggle}
        renderHealthy={renderHealthy}
      />
    </>
  );
};