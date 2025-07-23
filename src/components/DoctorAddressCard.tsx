import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { LocationOn, Verified, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface DoctorAddressCardProps {
  doctorName: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip?: string;
    full: string;
  };
  practiceName?: string;
  website?: string;
  verified?: boolean;
}

const DoctorAddressCard: React.FC<DoctorAddressCardProps> = ({
  doctorName,
  address,
  practiceName,
  website,
  verified = false
}) => {
  if (!address) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 15, 30, 0.9) 100%)',
        border: '1px solid rgba(0, 255, 198, 0.3)',
        borderRadius: '12px',
        mb: 3,
        overflow: 'visible',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
          borderRadius: '12px 12px 0 0'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                {doctorName}
              </Typography>
              {practiceName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Business sx={{ fontSize: 16, color: '#00ffc6' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {practiceName}
                  </Typography>
                </Box>
              )}
            </Box>
            {verified && (
              <Chip
                icon={<Verified />}
                label="NPI Verified"
                size="small"
                sx={{
                  background: 'rgba(0, 255, 198, 0.1)',
                  color: '#00ffc6',
                  border: '1px solid rgba(0, 255, 198, 0.3)',
                  '& .MuiChip-icon': {
                    color: '#00ffc6'
                  }
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
            <LocationOn sx={{ color: '#00ffc6', fontSize: 20, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" sx={{ color: '#fff', mb: 0.5 }}>
                {address.street}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {address.city}, {address.state} {address.zip || ''}
              </Typography>
            </Box>
          </Box>

          {website && (
            <Box sx={{ mt: 2 }}>
              <Typography 
                variant="body2" 
                component="a"
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#00ffc6',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                View Practice Website →
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorAddressCard;