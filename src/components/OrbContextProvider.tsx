import React, { useState, type ReactNode } from 'react';
import { OrbContext, type GradientColors } from './OrbContext';

interface OrbContextProviderProps {
  children: ReactNode;
}

export const OrbContextProvider: React.FC<OrbContextProviderProps> = ({ children }) => {
  const [gradientColors, setGradientColors] = useState<GradientColors>({
    start: '#7B42F6',
    end: '#00ffc6'
  });

  return (
    <OrbContext.Provider value={{ gradientColors, setGradientColors }}>
      {children}
    </OrbContext.Provider>
  );
};

