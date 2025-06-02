import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface GradientColors {
  start: string;
  end: string;
}

interface OrbContextType {
  gradientColors: GradientColors;
  setGradientColors: (colors: GradientColors) => void;
}

const OrbContext = createContext<OrbContextType | undefined>(undefined);

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

export const useOrbContext = (): OrbContextType => {
  const context = useContext(OrbContext);
  if (!context) {
    throw new Error('useOrbContext must be used within an OrbContextProvider');
  }
  return context;
};