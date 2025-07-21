/**
 * Component to display subscription usage and limits
 */

import React from 'react';
import { useUsageDisplay } from '../hooks/useSubscriptionLimits';
import { SUBSCRIPTION_TIERS } from '../lib/subscriptionTiers';
import { redirectToCheckout } from '../lib/stripe';

interface SubscriptionUsageDisplayProps {
  className?: string;
  showUpgradeButton?: boolean;
}

export const SubscriptionUsageDisplay: React.FC<SubscriptionUsageDisplayProps> = ({
  className = '',
  showUpgradeButton = true
}) => {
  const { tier, scansUsed, scansRemaining, dailyLimit, upgradeAvailable, loading, refresh } = useUsageDisplay();

  if (loading) {
    return (
      <div className={`subscription-usage-loading ${className}`}>
        <div className="usage-skeleton">
          <div className="skeleton-bar"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const usagePercentage = dailyLimit > 0 ? (scansUsed / dailyLimit) * 100 : 0;
  const isUnlimited = dailyLimit === 999999;

  const handleUpgrade = async () => {
    try {
      // Suggest next tier up
      const nextTier = getNextTierSuggestion(tier);
      if (nextTier) {
        await redirectToCheckout(nextTier as keyof typeof SUBSCRIPTION_TIERS, 'monthly');
      }
    } catch (error) {
      console.error('Error initiating upgrade:', error);
    }
  };

  const getNextTierSuggestion = (currentTier: string): string | null => {
    const tierOrder = ['free', 'repx1', 'repx2', 'repx3', 'repx4', 'repx5'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex < tierOrder.length - 1) {
      return tierOrder[currentIndex + 1];
    }
    
    return null;
  };

  const getUsageColor = (): string => {
    if (isUnlimited) return '#00ffc6';
    if (usagePercentage >= 90) return '#ff6b6b';
    if (usagePercentage >= 75) return '#ffd93d';
    return '#4B96DC';
  };

  return (
    <div className={`subscription-usage-display ${className}`}>
      <div className="usage-header">
        <div className="tier-info">
          <span className="tier-badge" style={{ backgroundColor: tierConfig?.uiTheme.primaryColor }}>
            {tierConfig?.icon} {tierConfig?.displayName || tier.toUpperCase()}
          </span>
          <button onClick={refresh} className="refresh-button" title="Refresh usage">
            🔄
          </button>
        </div>
      </div>

      <div className="usage-stats">
        {isUnlimited ? (
          <div className="unlimited-usage">
            <div className="unlimited-icon">∞</div>
            <div className="unlimited-text">
              <strong>Unlimited Scans</strong>
              <span>Used {scansUsed} today</span>
            </div>
          </div>
        ) : (
          <>
            <div className="usage-bar-container">
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ 
                    width: `${Math.min(usagePercentage, 100)}%`,
                    backgroundColor: getUsageColor()
                  }}
                />
              </div>
              <div className="usage-text">
                <span className="usage-numbers">
                  {scansUsed} / {dailyLimit} scans used today
                </span>
                <span className="remaining-scans" style={{ color: getUsageColor() }}>
                  {scansRemaining} remaining
                </span>
              </div>
            </div>

            {scansRemaining <= 2 && scansRemaining > 0 && (
              <div className="low-usage-warning">
                ⚠️ Only {scansRemaining} scan{scansRemaining === 1 ? '' : 's'} remaining today
              </div>
            )}

            {scansRemaining === 0 && (
              <div className="no-scans-warning">
                🚫 Daily scan limit reached
              </div>
            )}
          </>
        )}
      </div>

      {upgradeAvailable && showUpgradeButton && (
        <div className="upgrade-section">
          <div className="upgrade-message">
            Need more scans? Upgrade for higher limits and premium features.
          </div>
          <button onClick={handleUpgrade} className="upgrade-button">
            Upgrade Plan
          </button>
        </div>
      )}

      <style jsx>{`
        .subscription-usage-display {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin: 8px 0;
          backdrop-filter: blur(10px);
        }

        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tier-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tier-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #000;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .refresh-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .refresh-button:hover {
          opacity: 1;
        }

        .unlimited-usage {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .unlimited-icon {
          font-size: 24px;
          color: #00ffc6;
          font-weight: bold;
        }

        .unlimited-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .unlimited-text strong {
          color: #00ffc6;
          font-size: 14px;
        }

        .unlimited-text span {
          color: #94a3b8;
          font-size: 12px;
        }

        .usage-bar-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .usage-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .usage-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 3px;
        }

        .usage-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .usage-numbers {
          font-size: 12px;
          color: #94a3b8;
        }

        .remaining-scans {
          font-size: 12px;
          font-weight: 600;
        }

        .low-usage-warning {
          background: rgba(255, 211, 61, 0.1);
          border: 1px solid rgba(255, 211, 61, 0.3);
          border-radius: 6px;
          padding: 8px;
          font-size: 12px;
          color: #ffd93d;
          margin-top: 8px;
        }

        .no-scans-warning {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 6px;
          padding: 8px;
          font-size: 12px;
          color: #ff6b6b;
          margin-top: 8px;
        }

        .upgrade-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .upgrade-message {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .upgrade-button {
          background: linear-gradient(135deg, #9f58fa, #4B96DC);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upgrade-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(159, 88, 250, 0.3);
        }

        .usage-skeleton {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-bottom: 8px;
        }

        .skeleton-text {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          width: 60%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        @media (max-width: 480px) {
          .subscription-usage-display {
            padding: 12px;
          }

          .usage-text {
            flex-direction: column;
            gap: 4px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};