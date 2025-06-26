import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface EdgeIndicatorProps {
  position: 'left' | 'right' | 'top' | 'bottom';
  color?: string;
  animate?: boolean;
}

const Indicator = styled('div')<{ 
  position: string; 
  color?: string;
  animate?: boolean;
}>`
  position: absolute;
  background: linear-gradient(
    ${props => props.position === 'left' || props.position === 'right' ? 'to bottom' : 'to right'},
    rgba(${props => props.color || '255, 0, 255'}, 0.2),
    rgba(${props => props.color || '0, 255, 255'}, 0.1)
  );
  box-shadow: 0 0 8px rgba(${props => props.color || '0, 255, 255'}, 0.15);
  opacity: 0.6;
  z-index: 1;
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.position) {
      case 'left':
        return `
          top: 10px;
          bottom: 10px;
          left: -4px;
          width: 3px;
          border-radius: 2px 0 0 2px;
          transform: scaleY(1);
        `;
      case 'right':
        return `
          top: 10px;
          bottom: 10px;
          right: -4px;
          width: 3px;
          border-radius: 0 2px 2px 0;
          transform: scaleY(1);
        `;
      case 'top':
        return `
          left: 10px;
          right: 10px;
          top: -4px;
          height: 3px;
          border-radius: 2px 2px 0 0;
          transform: scaleX(1);
        `;
      case 'bottom':
        return `
          left: 10px;
          right: 10px;
          bottom: -4px;
          height: 3px;
          border-radius: 0 0 2px 2px;
          transform: scaleX(1);
        `;
    }
  }}
  
  /* Hover glow fin */
  &::after {
    content: '';
    position: absolute;
    background: radial-gradient(
      circle, 
      rgba(${props => props.color || '255, 0, 170'}, 0.4), 
      transparent
    );
    opacity: 0.1;
    transition: opacity 0.3s ease;
    
    ${props => {
      switch(props.position) {
        case 'left':
        case 'right':
          return `
            top: 50%;
            left: 50%;
            width: 10px;
            height: 80%;
            transform: translate(-50%, -50%);
          `;
        case 'top':
        case 'bottom':
          return `
            top: 50%;
            left: 50%;
            width: 80%;
            height: 10px;
            transform: translate(-50%, -50%);
          `;
      }
    }}
  }
  
  ${props => props.animate && `
    animation: ${props.position === 'left' || props.position === 'right' ? 'pulseVertical' : 'pulseHorizontal'} 4s ease-in-out infinite;
    
    @keyframes pulseVertical {
      0%, 100% { 
        opacity: 0.6; 
        transform: scaleY(1);
      }
      50% { 
        opacity: 1; 
        transform: scaleY(1.05);
      }
    }
    
    @keyframes pulseHorizontal {
      0%, 100% { 
        opacity: 0.6; 
        transform: scaleX(1);
      }
      50% { 
        opacity: 1; 
        transform: scaleX(1.05);
      }
    }
  `}
`;

const GlowEffect = styled('div')<{ glowPosition: string }>`
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Indicator}:hover & {
    opacity: 0.5;
  }
  
  ${props => {
    switch(props.glowPosition) {
      case 'left':
        return `
          top: 0;
          bottom: 0;
          width: 12px;
          left: -6px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 255, 255, 0.3),
            transparent
          );
        `;
      case 'right':
        return `
          top: 0;
          bottom: 0;
          width: 12px;
          right: -6px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 255, 255, 0.3),
            transparent
          );
        `;
      case 'top':
        return `
          left: 0;
          right: 0;
          height: 12px;
          top: -6px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 255, 255, 0.3),
            transparent
          );
        `;
      case 'bottom':
        return `
          left: 0;
          right: 0;
          height: 12px;
          bottom: -6px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 255, 255, 0.3),
            transparent
          );
        `;
    }
  }}
`;

const EdgeIndicator: React.FC<EdgeIndicatorProps> = ({ 
  position, 
  color,
  animate = true 
}) => {
  return (
    <Indicator position={position} color={color} animate={animate}>
      <GlowEffect glowPosition={position} />
    </Indicator>
  );
};

export default EdgeIndicator;