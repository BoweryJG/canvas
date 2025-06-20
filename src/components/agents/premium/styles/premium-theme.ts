/**
 * Premium Theme System for AI Sales Agent
 * Combines futuristic minimalism with executive luxury
 */

export const premiumTheme = {
  colors: {
    // Base colors
    deepBlack: '#000000',
    richBlack: '#0a0a0a',
    
    // Accent colors
    electricCyan: '#00ffc6',
    holographicBlue: '#00d4ff',
    luxuryGold: '#d4af37',
    platinum: '#e5e5e5',
    
    // Glass effects
    glassBackground: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassHover: 'rgba(255, 255, 255, 0.08)',
    
    // Executive tones
    executiveNavy: '#1a1f3a',
    watchDial: '#f8f8f8',
    leatherBrown: '#3e2723',
    chromeAccent: '#c0c0c0',
    
    // Status colors
    successGreen: '#10b981',
    warningAmber: '#f59e0b',
    dangerRed: '#ef4444',
  },
  
  gradients: {
    electricPulse: 'linear-gradient(135deg, #00ffc6 0%, #00d4ff 100%)',
    executiveGold: 'linear-gradient(135deg, #d4af37 0%, #f4e7d1 100%)',
    darkLuxury: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
    holographic: 'linear-gradient(45deg, #00ffc6 0%, #00d4ff 25%, #7B42F6 50%, #00ffc6 75%, #00d4ff 100%)',
    chromeShine: 'linear-gradient(135deg, #e5e5e5 0%, #c0c0c0 50%, #e5e5e5 100%)',
  },
  
  effects: {
    // Glassmorphism
    glassPanel: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 255, 198, 0.1)',
    },
    
    // Premium shadow
    luxuryShadow: {
      small: '0 4px 12px rgba(0, 0, 0, 0.4)',
      medium: '0 8px 24px rgba(0, 0, 0, 0.5)',
      large: '0 16px 48px rgba(0, 0, 0, 0.6)',
      glow: '0 0 40px rgba(0, 255, 198, 0.3)',
    },
    
    // Material effects
    blackGlass: {
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    
    // Chrome effect
    chrome: {
      background: 'linear-gradient(135deg, #e5e5e5 0%, #c0c0c0 50%, #e5e5e5 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
    },
  },
  
  typography: {
    executive: {
      fontFamily: "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: 300,
      letterSpacing: '0.02em',
    },
    technical: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    code: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontWeight: 400,
      letterSpacing: '0',
    },
  },
  
  animations: {
    // Timing functions
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elegant: 'cubic-bezier(0.23, 1, 0.32, 1)',
    
    // Durations
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    cinematic: '1000ms',
  },
  
  spacing: {
    micro: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    huge: '48px',
  },
  
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '20px',
    full: '9999px',
  },
};

// Utility functions for effects
export const getGlassEffect = (opacity: number = 0.05) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

export const getHolographicGlow = (color: string, intensity: number = 0.3) => ({
  boxShadow: `0 0 ${intensity * 100}px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
});

export const getLuxuryGradient = (angle: number = 135) => 
  `linear-gradient(${angle}deg, ${premiumTheme.colors.deepBlack} 0%, ${premiumTheme.colors.richBlack} 50%, ${premiumTheme.colors.executiveNavy} 100%)`;

export default premiumTheme;