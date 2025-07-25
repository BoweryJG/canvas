import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MetallicScrewProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  angle?: number;
}

const ScrewWrapper = styled(Box, {
  shouldForwardProp: (prop) => !['screwPosition', 'size', 'angle'].includes(prop as string),
})<{
  screwPosition: string;
  size: number;
  angle: number;
}>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center, 
    rgba(0,0,0,0.3) 0%, 
    rgba(0,0,0,0.15) 40%, 
    transparent 70%
  );
  box-shadow: 
    inset 0 1px 2px rgba(0,0,0,0.5),
    inset 0 -1px 1px rgba(255,255,255,0.1),
    0 1px 1px rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  ${props => {
    switch(props.screwPosition) {
      case 'top-left':
        return `top: 10px; left: 10px;`;
      case 'top-right':
        return `top: 10px; right: 10px;`;
      case 'bottom-left':
        return `bottom: 10px; left: 10px;`;
      case 'bottom-right':
        return `bottom: 10px; right: 10px;`;
    }
  }}
`;

const Screw = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'angle',
})<{ angle: number }>`
  position: relative;
  width: 4px;
  height: 4px;
  background: 
    radial-gradient(circle at 35% 35%, #e0e0e0 0%, #b8b8b8 15%, #888 40%, #555 70%, #222 100%);
  border-radius: 50%;
  box-shadow:
    inset 0 0.5px 1px rgba(255,255,255,0.4),
    inset 0 -0.5px 1px rgba(0,0,0,0.5),
    0 0.5px 2px rgba(0,0,0,0.8);
  transform: rotate(${props => props.angle}deg);
  animation: screwWiggle 5s ease-in-out infinite;
  animation-delay: ${props => props.angle * 0.01}s;
  
  @keyframes screwWiggle {
    0%, 100% { transform: rotate(${props => props.angle}deg); }
    25% { transform: rotate(${props => props.angle + 1.5}deg); }
    50% { transform: rotate(${props => props.angle - 1}deg); }
    75% { transform: rotate(${props => props.angle + 0.5}deg); }
  }
  
  /* Phillips head groove - horizontal */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70%;
    height: 0.5px;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(0,0,0,0.7) 20%, 
      rgba(0,0,0,0.7) 80%, 
      transparent
    );
    transform: translate(-50%, -50%);
  }
  
  /* Phillips head groove - vertical */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.5px;
    height: 70%;
    background: linear-gradient(
      180deg, 
      transparent, 
      rgba(0,0,0,0.7) 20%, 
      rgba(0,0,0,0.7) 80%, 
      transparent
    );
    transform: translate(-50%, -50%);
  }
`;

const ScrewJewel = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.5px;
  height: 1.5px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at center, 
    rgba(255,255,255,0.8), 
    rgba(255, 0, 255, 0.6), 
    rgba(255, 0, 170, 0.4), 
    transparent
  );
  border-radius: 50%;
  opacity: 0.7;
  animation: jewelPulse 3s infinite;
  
  @keyframes jewelPulse {
    0%, 100% { 
      opacity: 0.5; 
      transform: translate(-50%, -50%) scale(1); 
    }
    50% { 
      opacity: 0.8; 
      transform: translate(-50%, -50%) scale(1.2); 
    }
  }
`;

const MetallicScrew: React.FC<MetallicScrewProps> = ({ 
  position, 
  size = 6,
  angle 
}) => {
  // Generate random angle if not provided
  const screwAngle = angle ?? Math.random() * 45 - 22.5;
  
  return (
    <ScrewWrapper screwPosition={position} size={size} angle={screwAngle}>
      <Screw angle={screwAngle}>
        <ScrewJewel />
      </Screw>
    </ScrewWrapper>
  );
};

export default MetallicScrew;