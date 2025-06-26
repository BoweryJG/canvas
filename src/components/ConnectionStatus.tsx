import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true); // Default to online
  const [showStatus, setShowStatus] = useState(false);

  // More reliable connectivity check
  const checkConnectivity = async () => {
    try {
      // Check if we can reach the development server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(window.location.origin + '/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.ok;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch {
      try {
        // Fallback: check if we can reach a reliable external resource
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 5000);
        
        try {
          await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            cache: 'no-cache',
            mode: 'no-cors',
            signal: fallbackController.signal
          });
          clearTimeout(fallbackTimeoutId);
          return true; // If no error thrown, we have connectivity
        } catch (error) {
          clearTimeout(fallbackTimeoutId);
          throw error;
        }
      } catch {
        return false;
      }
    }
  };

  useEffect(() => {
    const handleOnline = async () => {
      const actuallyOnline = await checkConnectivity();
      if (actuallyOnline) {
        setIsOnline(true);
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    };

    const handleOffline = async () => {
      const actuallyOnline = await checkConnectivity();
      if (!actuallyOnline) {
        setIsOnline(false);
        setShowStatus(true);
      }
    };

    // Initial connectivity check
    const initialCheck = async () => {
      const online = await checkConnectivity();
      setIsOnline(online);
      if (!online) {
        setShowStatus(true);
      }
    };

    initialCheck();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check every 30 seconds
    const interval = setInterval(async () => {
      const online = await checkConnectivity();
      if (online !== isOnline) {
        setIsOnline(online);
        setShowStatus(true);
        if (online) {
          setTimeout(() => setShowStatus(false), 3000);
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{
            position: 'fixed',
            top: 'var(--safe-area-top, 0)',
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '12px 20px',
            background: isOnline 
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            animation: isOnline ? 'none' : 'pulse 2s infinite'
          }} />
          {isOnline ? (
            <>✓ Back online</>
          ) : (
            <>⚠️ You're offline - Some features may be limited</>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
