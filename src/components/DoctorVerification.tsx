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
import { smartVerifyDoctor } from '../lib/smartDoctorVerification';
import { analyzePracticeWebsite } from '../lib/practiceWebsiteDetector';

interface Props {
  doctorName: string;
  location?: string;
  specialty?: string;
  npi?: string;
  website?: string;
  practice?: string;
  confidence?: number;
  onConfirm: (verifiedProfile: any) => void;
  onReject: () => void;
}

export default function DoctorVerification({ 
  doctorName, 
  location, 
  specialty,
  npi,
  website,
  practice,
  confidence,
  onConfirm, 
  onReject 
}: Props) {
  const [loading, setLoading] = useState(false); // Changed: no loading if we already have data
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // Changed: always show details

  useEffect(() => {
    // If we already have data from parent, use it
    if (website || practice || confidence) {
      setProfile({
        name: doctorName,
        specialty: specialty,
        location: location,
        website: website,
        practice: practice,
        confidence: confidence || 0,
        npi: npi,
        additionalInfo: generateAdditionalInfo()
      });
      setLoading(false);
    } else {
      // Only perform verification if we don't have data
      performVerification();
    }
  }, [doctorName, location, website, practice]);

  const generateAdditionalInfo = () => {
    if (!website) {
      return "We couldn't find a practice website. Please confirm if this is the correct doctor.";
    }
    
    const analysis = analyzePracticeWebsite(website, undefined, undefined, doctorName);
    
    if (analysis.isPracticeWebsite) {
      return `Found practice website: ${practice || 'Practice'}. This appears to be their official site.`;
    } else if (analysis.websiteType === 'social' && analysis.confidence > 60) {
      // Official social media pages are valid!
      const platform = website.includes('facebook') ? 'Facebook' : 
                       website.includes('instagram') ? 'Instagram' : 'social media';
      return `Found official ${platform} page for ${practice || 'the practice'}. This is a verified practice page.`;
    } else if (analysis.websiteType === 'directory') {
      return `Found on ${analysis.websiteType} listing. We'll search for their official website during research.`;
    } else {
      return `Found online presence. We'll gather more information during research.`;
    }
  };

  const performVerification = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // Only do additional verification if needed
      console.log('🔍 Performing additional verification...');
      const smartResult = await smartVerifyDoctor(
        doctorName, 
        location,
        specialty,
        practice,
        undefined  // userId
      );
      
      console.log('✅ Smart verification result:', smartResult);
      
      setProfile({
        name: doctorName,
        specialty: specialty,
        location: location,
        website: smartResult.verifiedWebsite || website,
        practice: smartResult.practiceName || practice,
        confidence: Math.max(smartResult.confidence, confidence || 0),
        npi: npi,
        additionalInfo: smartResult.suggestedConfirmation || generateAdditionalInfo(),
        sources: smartResult.sources?.map(s => ({
          name: s.type === 'practice' ? 'Practice Website' : s.type,
          url: s.url,
          type: s.type as any
        })) || []
      });
      
      setShowDetails(true);
    } catch (err) {
      console.error('Verification error:', err);
      // On error, still show what we have
      setProfile({
        name: doctorName,
        specialty: specialty,
        location: location,
        website: website,
        practice: practice,
        confidence: confidence || 0,
        npi: npi,
        additionalInfo: generateAdditionalInfo()
      });
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

              {/* PRIMARY VERIFICATION - Website or Social Media */}
              {profile.website && (() => {
                const analysis = analyzePracticeWebsite(profile.website, undefined, undefined, profile.name);
                const isValidVerification = analysis.isPracticeWebsite || 
                  (analysis.websiteType === 'social' && analysis.confidence > 60);
                
                if (!isValidVerification) return null;
                
                const isSocialMedia = analysis.websiteType === 'social';
                const platform = profile.website.includes('facebook') ? 'Facebook' : 
                                profile.website.includes('instagram') ? 'Instagram' : 
                                profile.website.includes('linkedin') ? 'LinkedIn' : 'Social Media';
                
                return (
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
                          ✓ {isSocialMedia ? `VERIFIED ${platform.toUpperCase()} PAGE` : 'PRIMARY VERIFICATION - PRACTICE WEBSITE'}
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
                      {isSocialMedia 
                        ? `Official ${platform} practice page - verified for contact and updates`
                        : 'Official practice website found - highest confidence verification'
                      }
                    </Typography>
                  </Box>
                );
              })()}

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

                {/* Directory or unverified website (lower priority) */}
                {profile.website && (() => {
                  const analysis = analyzePracticeWebsite(profile.website, undefined, undefined, profile.name);
                  const isValidVerification = analysis.isPracticeWebsite || 
                    (analysis.websiteType === 'social' && analysis.confidence > 60);
                  
                  if (isValidVerification) return null; // Already shown above
                  
                  const typeLabel = analysis.websiteType === 'directory' ? 'DIRECTORY LISTING' :
                                   analysis.websiteType === 'social' ? 'SOCIAL MEDIA' :
                                   analysis.websiteType === 'hospital' ? 'HOSPITAL SYSTEM' :
                                   'ONLINE PRESENCE';
                  
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Language sx={{ color: '#00ffc6' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#00ffc6' }}>{typeLabel}</Typography>
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
                  );
                })()}

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