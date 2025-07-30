import React, { useEffect, useState } from 'react';
import { AlertCircle, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { getUsageSummary } from '../lib/subscriptionEnforcement';

interface QueryLimitIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'inline';
  onUpgradeClick?: () => void;
}

export const QueryLimitIndicator: React.FC<QueryLimitIndicatorProps> = ({ 
  position = 'top-right',
  onUpgradeClick 
}) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState({
    tier: 'free',
    scansUsed: 0,
    scansRemaining: 5,
    dailyLimit: 5,
    upgradeAvailable: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const summary = await getUsageSummary(user.id);
        setUsage(summary);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    // Refresh every minute
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user) return null;

  const percentage = usage.dailyLimit > 0 
    ? Math.round((usage.scansUsed / usage.dailyLimit) * 100)
    : 0;

  const isUnlimited = usage.dailyLimit === 999999;
  const isLow = usage.scansRemaining <= 2 && !isUnlimited;
  const isExhausted = usage.scansRemaining === 0 && !isUnlimited;

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      window.location.href = '/pricing';
    }
  };

  const tierColors = {
    free: 'from-gray-500 to-gray-600',
    repx1: 'from-cyan-500 to-purple-600',
    repx2: 'from-blue-500 to-cyan-500',
    repx3: 'from-purple-500 to-blue-500',
    repx4: 'from-orange-500 to-purple-500',
    repx5: 'from-yellow-400 to-pink-500'
  };

  const tierIcons = {
    free: '🔍',
    repx1: '📞',
    repx2: '📊',
    repx3: '🗺️',
    repx4: '⚡',
    repx5: '👑'
  };

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'inline': 'relative'
  };

  if (position === 'inline') {
    // Inline minimal version
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full
                    border border-gray-700/50 text-sm">
        <span className="text-gray-400">Queries:</span>
        {isUnlimited ? (
          <span className="text-green-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Unlimited
          </span>
        ) : (
          <>
            <span className={`font-medium ${isExhausted ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'}`}>
              {usage.scansRemaining}/{usage.dailyLimit}
            </span>
            {isLow && !isExhausted && (
              <button
                onClick={handleUpgradeClick}
                className="ml-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Upgrade
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  // Full floating indicator
  return (
    <div className={`${positionClasses[position]} max-w-xs`}>
      <div className={`
        bg-gradient-to-br ${tierColors[usage.tier] || tierColors.free}
        rounded-lg shadow-2xl border border-white/10 overflow-hidden
        transform transition-all duration-300 hover:scale-105
      `}>
        {/* Header */}
        <div className="px-4 py-3 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tierIcons[usage.tier] || tierIcons.free}</span>
              <div>
                <p className="text-xs text-white/80 uppercase tracking-wider">
                  {usage.tier === 'free' ? 'Free Tier' : usage.tier.toUpperCase()}
                </p>
                <p className="text-sm font-semibold text-white">
                  Daily Queries
                </p>
              </div>
            </div>
            {!isUnlimited && (
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {usage.scansRemaining}
                </p>
                <p className="text-xs text-white/80">
                  of {usage.dailyLimit} left
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {!isUnlimited && (
          <div className="px-4 py-3 bg-black/10">
            <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isExhausted ? 'bg-red-500' :
                  isLow ? 'bg-yellow-500' :
                  'bg-white'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-white/80 mt-2 text-center">
              {usage.scansUsed} queries used today
            </p>
          </div>
        )}

        {/* Status Message */}
        <div className="px-4 py-3 bg-black/10">
          {isUnlimited ? (
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">Unlimited Queries Active</span>
            </div>
          ) : isExhausted ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Daily Limit Reached</span>
              </div>
              <button
                onClick={handleUpgradeClick}
                className="w-full py-2 px-4 bg-white text-gray-900 font-semibold rounded-lg
                         flex items-center justify-center gap-2 hover:bg-white/90 transition-all
                         transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                Upgrade Now
              </button>
            </div>
          ) : isLow ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-yellow-300">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Running Low</span>
              </div>
              <button
                onClick={handleUpgradeClick}
                className="w-full py-2 px-3 bg-white/20 text-white font-medium rounded-lg
                         flex items-center justify-center gap-2 hover:bg-white/30 transition-all
                         text-sm"
              >
                <TrendingUp className="w-4 h-4" />
                Get More Queries
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>Resets at midnight UTC</span>
              {usage.upgradeAvailable && (
                <button
                  onClick={handleUpgradeClick}
                  className="text-cyan-300 hover:text-cyan-200 transition-colors text-xs"
                >
                  Upgrade →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tier Benefits Preview */}
        {usage.tier === 'free' && !isUnlimited && (
          <div className="px-4 py-3 bg-gradient-to-t from-black/30 to-transparent border-t border-white/10">
            <p className="text-xs text-white/80 mb-2">Upgrade Benefits:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-white/90">
                <span className="text-cyan-400">RepX2:</span> 10 queries/day
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <span className="text-purple-400">RepX3:</span> 25 queries/day
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <span className="text-yellow-400">RepX5:</span> Unlimited
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryLimitIndicator;