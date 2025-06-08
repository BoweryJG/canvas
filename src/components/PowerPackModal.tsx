import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  POWER_PACKS, 
  getUrgencyMessage, 
  getROIMessage,
  getSubscriptionComparison,
  type PowerPack 
} from '../lib/powerPackPricing';

interface PowerPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPack: (pack: PowerPack) => void;
  currentProduct?: string;
}

export const PowerPackModal: React.FC<PowerPackModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectPack
}) => {
  const [selectedPack, setSelectedPack] = useState<PowerPack | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPack = async (pack: PowerPack) => {
    setSelectedPack(pack);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      onSelectPack(pack);
      setIsProcessing(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="power-pack-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="power-pack-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <h2>
                <span className="scale-icon">🚀</span>
                Scale Your Outreach Instantly
              </h2>
              <p className="subtitle">
                You just analyzed 1 doctor. Now analyze 10, 100, or even 1000+ in minutes!
              </p>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Value Proposition */}
          <div className="value-prop">
            <div className="prop-item">
              <span className="icon">⚡</span>
              <span className="text">Instant Batch Processing</span>
            </div>
            <div className="prop-item">
              <span className="icon">📊</span>
              <span className="text">CSV Upload & Export</span>
            </div>
            <div className="prop-item">
              <span className="icon">🎯</span>
              <span className="text">Same AI Intelligence at Scale</span>
            </div>
          </div>

          {/* Power Packs Grid */}
          <div className="packs-grid">
            {POWER_PACKS.map((pack) => (
              <motion.div
                key={pack.id}
                className={`pack-card ${pack.popular ? 'popular' : ''} ${pack.bestValue ? 'best-value' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {pack.popular && <div className="badge popular-badge">POPULAR</div>}
                {pack.bestValue && <div className="badge best-value-badge">BEST VALUE</div>}
                
                <div className="pack-header">
                  <h3>{pack.name}</h3>
                  <div className="scan-count">
                    <span className="number">{pack.scans.toLocaleString()}</span>
                    <span className="label">scans</span>
                  </div>
                </div>

                <div className="pack-pricing">
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">{pack.price}</span>
                  </div>
                  <div className="per-scan">
                    ${pack.pricePerScan.toFixed(2)} per scan
                  </div>
                  <div className="savings">
                    Save {pack.savings}%
                  </div>
                </div>

                <div className="pack-features">
                  <div className="feature-item">
                    <span className="icon">⚡</span>
                    <span>{pack.processingSpeed}</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">🎯</span>
                    <span>{getROIMessage(pack)}</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">💎</span>
                    <span>{getSubscriptionComparison(pack)}</span>
                  </div>
                </div>

                <div className="pack-footer">
                  <button
                    className={`select-btn ${selectedPack?.id === pack.id ? 'selected' : ''}`}
                    onClick={() => handleSelectPack(pack)}
                    disabled={isProcessing}
                  >
                    {selectedPack?.id === pack.id && isProcessing ? (
                      <span className="processing">Processing...</span>
                    ) : (
                      <>
                        Get {pack.scans} Scans
                        <span className="arrow">→</span>
                      </>
                    )}
                  </button>
                  <div className="urgency-message">
                    {getUrgencyMessage(pack)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="modal-footer">
            <p className="footer-text">
              🔒 Secure checkout • 💳 All major cards accepted • ⚡ Instant activation
            </p>
            <p className="guarantee">
              30-day money-back guarantee on all power packs
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PowerPackModal;