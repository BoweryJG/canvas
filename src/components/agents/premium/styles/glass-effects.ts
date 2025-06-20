/**
 * Glass Effects and Premium Styling Utilities
 */

import type { CSSProperties } from 'react';
import premiumTheme from './premium-theme';

// Glass morphism presets
export const glassEffects = {
  light: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
  },
  
  medium: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.15)',
  },
  
  heavy: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 12px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  
  dark: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
  
  premium: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    backdropFilter: 'blur(40px) saturate(150%)',
    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `
      0 0.5px 0 1px rgba(255, 255, 255, 0.23) inset,
      0 1px 0 0 rgba(255, 255, 255, 0.07) inset,
      0 0 20px 0 rgba(0, 255, 198, 0.1),
      0 12px 32px 0 rgba(0, 0, 0, 0.3)
    `,
  },
};

// Holographic effects
export const holographicEffects = {
  subtle: {
    background: `linear-gradient(
      45deg,
      rgba(0, 255, 198, 0.1) 0%,
      rgba(0, 212, 255, 0.1) 25%,
      rgba(123, 66, 246, 0.1) 50%,
      rgba(0, 255, 198, 0.1) 75%,
      rgba(0, 212, 255, 0.1) 100%
    )`,
    backgroundSize: '400% 400%',
    animation: 'holographicShift 10s ease infinite',
  },
  
  intense: {
    background: `linear-gradient(
      45deg,
      rgba(0, 255, 198, 0.3) 0%,
      rgba(0, 212, 255, 0.3) 25%,
      rgba(123, 66, 246, 0.3) 50%,
      rgba(0, 255, 198, 0.3) 75%,
      rgba(0, 212, 255, 0.3) 100%
    )`,
    backgroundSize: '400% 400%',
    animation: 'holographicShift 5s ease infinite',
    filter: 'hue-rotate(0deg)',
  },
};

// Chrome and metallic effects
export const metallicEffects = {
  chrome: {
    background: `linear-gradient(
      135deg,
      #e5e5e5 0%,
      #f5f5f5 25%,
      #c0c0c0 50%,
      #f5f5f5 75%,
      #e5e5e5 100%
    )`,
    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.2)
    `,
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
  },
  
  brushedMetal: {
    background: `repeating-linear-gradient(
      90deg,
      #c0c0c0,
      #c0c0c0 1px,
      #d4d4d4 1px,
      #d4d4d4 2px
    )`,
    boxShadow: `
      inset 0 0 5px rgba(0, 0, 0, 0.1),
      0 1px 0 rgba(255, 255, 255, 0.2)
    `,
  },
  
  gold: {
    background: `linear-gradient(
      135deg,
      #d4af37 0%,
      #f4e7d1 45%,
      #d4af37 50%,
      #f4e7d1 55%,
      #d4af37 100%
    )`,
    boxShadow: `
      0 2px 4px rgba(212, 175, 55, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
  },
};

// Glow effects
export const glowEffects = {
  cyan: {
    boxShadow: `0 0 30px ${premiumTheme.colors.electricCyan}40`,
    filter: `drop-shadow(0 0 10px ${premiumTheme.colors.electricCyan}60)`,
  },
  
  blue: {
    boxShadow: `0 0 30px ${premiumTheme.colors.holographicBlue}40`,
    filter: `drop-shadow(0 0 10px ${premiumTheme.colors.holographicBlue}60)`,
  },
  
  gold: {
    boxShadow: `0 0 30px ${premiumTheme.colors.luxuryGold}40`,
    filter: `drop-shadow(0 0 10px ${premiumTheme.colors.luxuryGold}60)`,
  },
  
  pulse: {
    animation: 'glowPulse 2s ease-in-out infinite',
  },
};

// Depth effects
export const depthEffects = {
  floating: {
    transform: 'translateY(-4px)',
    boxShadow: `
      0 10px 20px rgba(0, 0, 0, 0.3),
      0 6px 6px rgba(0, 0, 0, 0.2)
    `,
  },
  
  embossed: {
    boxShadow: `
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  },
  
  layered: {
    boxShadow: `
      0 1px 2px rgba(0, 0, 0, 0.07),
      0 2px 4px rgba(0, 0, 0, 0.07),
      0 4px 8px rgba(0, 0, 0, 0.07),
      0 8px 16px rgba(0, 0, 0, 0.07),
      0 16px 32px rgba(0, 0, 0, 0.07)
    `,
  },
};

// Utility function to combine effects
export const combineEffects = (...effects: CSSProperties[]): CSSProperties => {
  return effects.reduce((acc, effect) => ({ ...acc, ...effect }), {});
};

// Premium button styles
export const premiumButton = {
  base: {
    ...glassEffects.medium,
    ...premiumTheme.typography.executive,
    padding: '12px 24px',
    borderRadius: premiumTheme.borderRadius.medium,
    cursor: 'pointer',
    transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  
  hover: {
    ...glassEffects.heavy,
    transform: 'translateY(-2px)',
    boxShadow: `
      0 0 30px ${premiumTheme.colors.electricCyan}40,
      0 12px 32px 0 rgba(0, 0, 0, 0.3)
    `,
  },
  
  active: {
    transform: 'translateY(0)',
    boxShadow: `
      inset 0 2px 4px rgba(0, 0, 0, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.1)
    `,
  },
};

// Add keyframe animations to be injected into global styles
export const keyframeAnimations = `
  @keyframes holographicShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes glowPulse {
    0%, 100% { 
      box-shadow: 0 0 20px currentColor;
      opacity: 0.8;
    }
    50% { 
      box-shadow: 0 0 40px currentColor;
      opacity: 1;
    }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes floatAnimation {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

export default {
  glassEffects,
  holographicEffects,
  metallicEffects,
  glowEffects,
  depthEffects,
  combineEffects,
  premiumButton,
  keyframeAnimations,
};