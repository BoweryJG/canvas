import { useContext } from 'react';
import { OrbContext, type OrbContextType } from './OrbContext';

export const useOrbContext = (): OrbContextType => {
  const context = useContext(OrbContext);
  if (!context) {
    throw new Error('useOrbContext must be used within an OrbContextProvider');
  }
  return context;
};