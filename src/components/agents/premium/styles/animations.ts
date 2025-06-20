/**
 * Premium Animation Configurations
 * Cinematic animations for the AI Sales Agent experience
 */

import type { Variants } from 'framer-motion';

// Portal opening animation
export const portalAnimation: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  expanding: {
    scale: [1, 1.2, 50],
    opacity: [1, 0.8, 0],
    transition: {
      duration: 1.2,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Shimmer effect for portal
export const shimmerAnimation: Variants = {
  initial: {
    backgroundPosition: '200% 0',
  },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// Desk materialization
export const deskMaterializeAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.5,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.1,
    },
  },
};

// Light particle effect
export const particleAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1.5, 0],
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
    transition: {
      duration: 2,
      delay: i * 0.05,
      ease: 'easeOut',
    },
  }),
};

// Agent entrance
export const agentEntranceAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1,
      delay: 0.8,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

// Executive avatar idle animation
export const avatarIdleAnimation = {
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Digital display animation
export const displayAnimation: Variants = {
  hidden: {
    opacity: 0,
    scaleY: 0,
    originY: 0.5,
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: {
      duration: 0.8,
      delay: 1.2,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

// Message flow animation
export const messageFlowAnimation: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
    },
  },
};

// Holographic flicker
export const holographicFlicker = {
  animate: {
    opacity: [1, 0.98, 1, 0.97, 1],
    scaleY: [1, 0.999, 1, 0.998, 1],
    transition: {
      duration: 5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Voice waveform animation
export const waveformAnimation: Variants = {
  idle: {
    scaleY: 0.2,
  },
  speaking: {
    scaleY: [0.2, 1, 0.3, 0.8, 0.2],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Orb pulse animation
export const orbPulseAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    boxShadow: [
      '0 0 20px rgba(0, 255, 198, 0.4)',
      '0 0 40px rgba(0, 255, 198, 0.6)',
      '0 0 20px rgba(0, 255, 198, 0.4)',
    ],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Luxury fade in
export const luxuryFadeIn: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

// Graph building animation
export const graphBuildAnimation: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 2,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.5,
      },
    },
  },
};

// Document slide animation
export const documentSlideAnimation: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.4,
    },
  },
};

// Typing indicator animation
export const typingAnimation = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Chrome shine effect
export const chromeShineAnimation: Variants = {
  initial: {
    backgroundPosition: '-200% center',
  },
  hover: {
    backgroundPosition: '200% center',
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    },
  },
};

export default {
  portalAnimation,
  shimmerAnimation,
  deskMaterializeAnimation,
  particleAnimation,
  agentEntranceAnimation,
  avatarIdleAnimation,
  displayAnimation,
  messageFlowAnimation,
  holographicFlicker,
  waveformAnimation,
  orbPulseAnimation,
  luxuryFadeIn,
  graphBuildAnimation,
  documentSlideAnimation,
  typingAnimation,
  chromeShineAnimation,
};