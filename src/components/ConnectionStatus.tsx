import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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