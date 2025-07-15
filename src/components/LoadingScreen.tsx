import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  color: white;
  z-index: 9999;
`;

const LoadingContent = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const LoadingText = styled(Typography)`
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(45deg, #9F58FA, #00FFC6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SubText = styled(Typography)`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
`;

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading Provider Intelligence...' }) => {
  return (
    <LoadingContainer>
      <LoadingContent>
        <LoadingText>🎯 CANVAS</LoadingText>
        <CircularProgress 
          sx={{ 
            color: '#9F58FA',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <SubText>{message}</SubText>
      </LoadingContent>
    </LoadingContainer>
  );
};