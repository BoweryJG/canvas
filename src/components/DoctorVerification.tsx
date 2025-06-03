/**
 * Doctor Verification Component - Confirm we have the RIGHT doctor
 * Category-defining verification flow
 */

import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Skeleton,
  Chip,
  Collapse,
  Alert
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Language, 
  Phone, 
  LocationOn,
  Business,
  MedicalServices,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyDoctor } from '../lib/doctorVerification';

// Helper function to check if website is a practice website
const isPracticeWebsite = (website: string): boolean => {
  const url = website.toLowerCase();
  const excludeList = [
    'healthgrades', 'vitals.com', 'webmd.com', 'zocdoc.com', 
    'yellowpages', 'yelp.com', 'google.com', 'facebook.com',
    'linkedin.com', 'wikipedia.org', 'ratemds.com'
  ];
  
  if (excludeList.some(excluded => url.includes(excluded))) {
    return false;
  }
  
  const practiceIndicators = [
    'dental', 'medical', 'health', 'clinic', 'practice', 
    'care', 'center', 'associates', 'group', 'family',
    'orthopedic', 'cardio', 'neuro', 'pediatric', 'dermat'
  ];
  
  if (practiceIndicators.some(indicator => url.includes(indicator))) {
    return true;
  }
  
  return (url.includes('.com') || url.includes('.org') || url.includes('.health'));
};

interface Props {
  doctorName: string;
  location?: string;
  onConfirm: (verifiedProfile: any) => void;
  onReject: () => void;
}

export default function DoctorVerification({ doctorName, location, onConfirm, onReject }: Props) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    performVerification();
  }, [doctorName, location]);

  const performVerification = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const result = await verifyDoctor(doctorName, location);
      setProfile(result);
      setShowDetails(true);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (profile) {
      onConfirm(profile);
    }
  };

  if (loading) {
    return (
      <Card sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
        border: '1px solid #00ffc6'
      }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#00ffc6', mb: 3 }}>
            🔍 Verifying Doctor Identity...
          </Typography>
          <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
          <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
          <Skeleton variant="rectangular" height={100} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
        border: '1px solid #ff6b6b'
      }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Unable to verify doctor information. Please check the name and location.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={performVerification}
              startIcon={<Refresh />}
              sx={{ borderColor: '#00ffc6', color: '#00ffc6' }}
            >
              Retry
            </Button>
            <Button 
              variant="outlined" 
              onClick={onReject}
              sx={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
            >
              Enter Different Name
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card sx={{ 
          maxWidth: 700, 
          mx: 'auto', 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
          border: '2px solid #00ffc6',
          boxShadow: '0 0 30px rgba(0, 255, 198, 0.3)'
        }}>
          <CardContent>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3
            }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                Is this the right doctor?
              </Typography>
              <Chip 
                label={`${profile.confidence}% Match`}
                sx={{ 
                  background: profile.confidence > 80 ? '#00ffc6' : '#ffa726',
                  color: '#000',
                  fontWeight: 700
                }}
              />
            </Box>

            {/* Doctor Profile Card */}
            <Box sx={{ 
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                Dr. {profile.name}
              </Typography>

              {/* PRIMARY VERIFICATION - Website (if practice website) */}
              {profile.website && isPracticeWebsite(profile.website) ? (
                <Box sx={{ 
                  background: 'linear-gradient(135deg, rgba(0,255,198,0.2) 0%, rgba(123,66,246,0.2) 100%)',
                  borderRadius: '8px',
                  p: 2,
                  mb: 3,
                  border: '2px solid #00ffc6'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Language sx={{ color: '#00ffc6', fontSize: 28 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00ffc6', fontWeight: 700 }}>
                        ✓ PRIMARY VERIFICATION - PRACTICE WEBSITE
                      </Typography>
                      <Typography 
                        component="a" 
                        href={profile.website} 
                        target="_blank"
                        sx={{ 
                          color: '#fff',
                          textDecoration: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          display: 'block',
                          '&:hover': { 
                            textDecoration: 'underline',
                            color: '#00ffc6' 
                          }
                        }}
                      >
                        {profile.website}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Official practice website found - highest confidence verification
                  </Typography>
                </Box>
              ) : null}

              {/* Other Information */}
              <Box sx={{ display: 'grid', gap: 2 }}>
                {profile.specialty && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MedicalServices sx={{ color: '#00ffc6' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00ffc6' }}>SPECIALTY</Typography>
                      <Typography sx={{ color: '#fff' }}>{profile.specialty}</Typography>
                    </Box>
                  </Box>
                )}

                {profile.practice && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Business sx={{ color: '#00ffc6' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00ffc6' }}>PRACTICE</Typography>
                      <Typography sx={{ color: '#fff' }}>{profile.practice}</Typography>
                    </Box>
                  </Box>
                )}

                {profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: '#00ffc6' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00ffc6' }}>LOCATION</Typography>
                      <Typography sx={{ color: '#fff' }}>{profile.location}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Directory website (lower priority) */}
                {profile.website && !isPracticeWebsite(profile.website) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Language sx={{ color: '#00ffc6' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00ffc6' }}>DIRECTORY LISTING</Typography>
                      <Typography 
                        component="a" 
                        href={profile.website} 
                        target="_blank"
                        sx={{ 
                          color: '#7B42F6',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {profile.website}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {profile.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: '#00ffc6' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00ffc6' }}>CONTACT</Typography>
                      <Typography sx={{ color: '#fff' }}>{profile.phone}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Additional Details */}
              <Collapse in={showDetails}>
                {profile.additionalInfo && (
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {profile.additionalInfo}
                    </Typography>
                  </Box>
                )}
              </Collapse>
            </Box>

            {/* Sources */}
            {profile.sources && profile.sources.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#00ffc6', mb: 1 }}>
                  VERIFIED FROM {profile.sources.length} SOURCES
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profile.sources.map((source: any, i: number) => (
                    <Chip 
                      key={i}
                      label={source.name}
                      size="small"
                      sx={{ 
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CheckCircle />}
                onClick={handleConfirm}
                sx={{
                  background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(0,255,198,0.5)'
                  }
                }}
              >
                YES, THIS IS CORRECT
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Cancel />}
                onClick={onReject}
                sx={{
                  borderColor: '#ff6b6b',
                  color: '#ff6b6b',
                  '&:hover': {
                    background: 'rgba(255,107,107,0.1)',
                    borderColor: '#ff6b6b'
                  }
                }}
              >
                NO, WRONG DOCTOR
              </Button>
            </Box>

            {/* Hint */}
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                textAlign: 'center',
                mt: 2,
                color: 'rgba(255,255,255,0.5)'
              }}
            >
              Verify the practice name and location match your target
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}