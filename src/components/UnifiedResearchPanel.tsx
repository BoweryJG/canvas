import React, { useState, useEffect } from 'react';
import { EnhancedResearchPanelWithRender } from './EnhancedResearchPanelWithRender';
import { EnhancedResearchPanel } from './EnhancedResearchPanel';
import { BackendToggle } from './BackendToggle';
import { checkBackendHealth } from '../lib/renderBackendAPI';

export const UnifiedResearchPanel: React.FC = () => {
  const [useRenderBackend, setUseRenderBackend] = useState(() => {
    // Check localStorage for preference
    const saved = localStorage.getItem('preferRenderBackend');
    return saved === 'true';
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