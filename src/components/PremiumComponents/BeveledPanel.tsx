import React from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface BeveledPanelProps {
  children: React.ReactNode;
  elevation?: number;
  accentColor?: string;
  className?: string;
}

const StyledBeveledPanel = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'accentColor',
})<{ accentColor?: string }>`
  position: relative;
  background: 
    linear-gradient(135deg, #1a1a1a 0%, #252525 20%, #1e1e1e 40%, #2a2a2a 60%, #1f1f1f 80%, #1a1a1a 100%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 1px,
      rgba(255,255,255,0.01) 1px,
      rgba(255,255,255,0.01) 2px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 1px,
      rgba(0,0,0,0.02) 1px,
      rgba(0,0,0,0.02) 2px
    ),
    radial-gradient(ellipse at top left, rgba(255,255,255,0.03) 0%, transparent 40%),
    radial-gradient(ellipse at bottom right, rgba(0,0,0,0.1) 0%, transparent 40%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
  box-shadow: 
    inset 0 2px 4px rgba(255,255,255,0.05),
    inset 0 -2px 6px rgba(0,0,0,0.6),
    inset 2px 0 4px rgba(0,0,0,0.3),
    inset -2px 0 4px rgba(0,0,0,0.3),
    0 4px 12px rgba(0,0,0,0.5),
    0 8px 24px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-conic-gradient(
        from 0deg at 50% 50%,
        transparent 0deg,
        transparent 0.25deg,
        rgba(255,255,255,0.01) 0.25deg,
        rgba(255,255,255,0.01) 0.5deg
      );
    opacity: 0.5;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      inset 0 2px 4px rgba(255,255,255,0.08),
      inset 0 -2px 6px rgba(0,0,0,0.8),
      0 8px 24px rgba(0,0,0,0.6),
      0 16px 48px rgba(0,0,0,0.4),
      0 4px 16px rgba(${props => props.accentColor || '159, 88, 250'}, 0.2);
  }
`;

const AccentLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'accentColor',
})<{ accentColor?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg, 
    transparent, 
    ${props => props.accentColor || 'rgb(159, 88, 250)'}, 
    transparent
  );
  animation: pulseGlow 3s ease-in-out infinite;
  z-index: 5;
  
  @keyframes pulseGlow {
    0%, 100% {
      opacity: 0.6;
      box-shadow: 0 0 10px currentColor;
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
    }
  }
`;

const BeveledPanel: React.FC<BeveledPanelProps> = ({ 
  children, 
  elevation = 1, 
  accentColor,
  className 
}) => {
  return (
    <StyledBeveledPanel elevation={elevation} accentColor={accentColor} className={className}>
      <AccentLine accentColor={accentColor} />
      {children}
    </StyledBeveledPanel>
  );
};

export default BeveledPanel;