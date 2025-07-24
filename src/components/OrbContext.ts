import { createContext } from 'react';

export interface GradientColors {
  start: string;
  end: string;
}

export interface OrbContextType {
  gradientColors: GradientColors;
  setGradientColors: (colors: GradientColors) => void;
}

export const OrbContext = createContext<OrbContextType | undefined>(undefined);