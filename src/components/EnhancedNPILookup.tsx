import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import { debounce } from 'lodash';
import { 
  LocalHospital,
  Psychology,
  Face,
  Healing,
  SentimentSatisfiedAlt,
  MedicalServices,
  VerifiedUser,
  Phone,
  LocationOn,
  Business,
  Badge,
  AutoAwesome
} from '@mui/icons-material';
import { getApiEndpoint } from '../config/api';
import { withRetry, APIError, getUserFriendlyError } from '../utils/errorHandling';

export interface NPIDoctor {
  npi: string;
  displayName: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  city: string;
  state: string;
  fullAddress: string;
  phone: string;
  organizationName?: string;
}

// Glassmorphism components
const NPIInputContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
}));

const NPIInput = styled('input')(() => ({
  width: '100%',
  padding: '16px 24px',
  fontSize: '16px',
  fontWeight: 500,
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  color: '#fff',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  
  '&:focus': {
    borderColor: '#00ffc6',
    background: 'rgba(255, 255, 255, 0.08)',
    boxShadow: `
      0 0 0 4px rgba(0, 255, 198, 0.1),
      0 10px 40px rgba(0, 255, 198, 0.2)
    `,
  },
}));

const NPIDropdown = styled(motion.div)(() => ({
  position: 'absolute',
  top: 'calc(100% + 12px)',
  left: 0,
  right: 0,
  background: 'rgba(10, 10, 15, 0.95)',
  backdropFilter: 'blur(30px)',
  borderRadius: '20px',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  boxShadow: `
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 0 100px rgba(0, 255, 198, 0.1),
    inset 0 0 30px rgba(0, 255, 198, 0.05)
  `,
  overflow: 'hidden',
  zIndex: 1000,
}));

const LoadingBar = styled(LinearProgress)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  background: 'transparent',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
  },
});

const DoctorCard = styled(motion.button)(() => ({
  width: '100%',
  padding: '20px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  cursor: 'pointer',
  textAlign: 'left',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 198, 0.05) 50%, transparent 100%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  
  '&:hover::before': {
    transform: 'translateX(100%)',
  },
  
  '&:hover': {
    background: 'rgba(0, 255, 198, 0.03)',
  },
  
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const SpecialtyIcon = styled(Box)(() => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.1) 0%, rgba(123, 66, 246, 0.1) 100%)',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  marginRight: '16px',
  flexShrink: 0,
  
  '& svg': {
    fontSize: '24px',
    color: '#00ffc6',
  },
}));

const DataReveal = styled(motion.div)({
  marginTop: '12px',
  padding: '12px',
  background: 'rgba(0, 255, 198, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 255, 198, 0.1)',
});

const InfoChip = styled(Chip)({
  background: 'rgba(123, 66, 246, 0.1)',
  border: '1px solid rgba(123, 66, 246, 0.3)',
  color: '#fff',
  fontWeight: 500,
  height: '28px',
  '& .MuiChip-icon': {
    color: '#7B42F6',
  },
});

// Specialty icons mapping
const getSpecialtyIcon = (specialty: string) => {
  const specialtyLower = specialty.toLowerCase();
  
  if (specialtyLower.includes('dentist') || specialtyLower.includes('dental')) {
    return <LocalHospital />;
  } else if (specialtyLower.includes('oral surgeon')) {
    return <Healing />;
  } else if (specialtyLower.includes('plastic')) {
    return <Face />;
  } else if (specialtyLower.includes('dermatolog')) {
    return <SentimentSatisfiedAlt />;
  } else if (specialtyLower.includes('psychiatr') || specialtyLower.includes('psycholog')) {
    return <Psychology />;
  } else {
    return <MedicalServices />;
  }
};

// Cache for NPI lookups
const npiCache = new Map<string, { data: NPIDoctor[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface EnhancedNPILookupProps {
  onSelect: (doctor: NPIDoctor) => void;
  placeholder?: string;
  focusSpecialties?: string[];
}

export const EnhancedNPILookup: React.FC<EnhancedNPILookupProps> = ({
  onSelect,
  placeholder = "Type doctor name to discover their NPI data...",
  focusSpecialties = [
    'dentist',
    'oral surgeon',
    'prosthodontist',
    'implantologist',
    'plastic surgeon',
    'dermatologist'
  ]
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<NPIDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Enhanced search function with specialty focus
  const searchDoctors = useCallback(async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      // Check cache
      const cacheKey = searchTerm.toLowerCase();
      const cached = npiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSuggestions(cached.data);
        setShowDropdown(true);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const url = `${getApiEndpoint('npiLookup')}?search=${encodeURIComponent(searchTerm)}`;
        
        const data = await withRetry(async () => {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new APIError(`Failed to search doctors`, response.status, url);
          }
          
          return response.json();
        }, {
          maxAttempts: 3,
          initialDelay: 500,
        });
        
        let doctors = Array.isArray(data) ? data : (data.results || []);
        
        // Prioritize focus specialties
        doctors = doctors.sort((a: NPIDoctor, b: NPIDoctor) => {
          const aIsFocus = focusSpecialties.some(s => 
            a.specialty.toLowerCase().includes(s.toLowerCase())
          );
          const bIsFocus = focusSpecialties.some(s => 
            b.specialty.toLowerCase().includes(s.toLowerCase())
          );
          
          if (aIsFocus && !bIsFocus) return -1;
          if (!aIsFocus && bIsFocus) return 1;
          return 0;
        });
        
        // Cache results
        npiCache.set(cacheKey, {
          data: doctors,
          timestamp: Date.now()
        });
        
        setSuggestions(doctors);
        setShowDropdown(true);
      } catch (error) {
        console.error('Failed to search doctors:', error);
        setError(getUserFriendlyError(error));
        setSuggestions([]);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
  }, [focusSpecialties]);
  
  // Create debounced version of searchDoctors
  const debouncedSearchDoctors = React.useMemo(
    () => debounce(searchDoctors, 300),
    [searchDoctors]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearchDoctors(value);
  };

  const handleSelect = (doctor: NPIDoctor, index: number) => {
    setSelectedIndex(index);
    setTimeout(() => {
      setSearch(doctor.displayName);
      setShowDropdown(false);
      onSelect(doctor);
    }, 300);
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 25,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.15,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    selected: {
      scale: 0.98,
      transition: {
        duration: 0.2,
      }
    }
  };

  return (
    <NPIInputContainer>
      <Box sx={{ position: 'relative' }}>
        <NPIInput
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowDropdown(false);
              setSelectedIndex(null);
            }, 300);
          }}
          placeholder={placeholder}
        />
        
        {search.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <AutoAwesome sx={{ color: '#00ffc6', fontSize: 20 }} />
          </motion.div>
        )}
      </Box>

      <AnimatePresence>
        {showDropdown && (
          <NPIDropdown
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {loading && <LoadingBar />}
            
            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {suggestions.length > 0 ? (
                suggestions.map((doctor, index) => (
                  <DoctorCard
                    key={doctor.npi}
                    onClick={() => handleSelect(doctor, index)}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate={selectedIndex === index ? "selected" : "visible"}
                    whileHover={{ x: 10 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <SpecialtyIcon>
                        {getSpecialtyIcon(doctor.specialty)}
                      </SpecialtyIcon>
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            {doctor.displayName}
                          </Typography>
                          <VerifiedUser sx={{ color: '#00ffc6', fontSize: 18 }} />
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                          {doctor.specialty}
                        </Typography>
                        
                        <AnimatePresence>
                          {selectedIndex === index && (
                            <DataReveal
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                <InfoChip
                                  icon={<Badge />}
                                  label={`NPI: ${doctor.npi}`}
                                  size="small"
                                />
                                {doctor.credential && (
                                  <InfoChip
                                    label={doctor.credential}
                                    size="small"
                                  />
                                )}
                              </Box>
                              
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationOn sx={{ color: '#7B42F6', fontSize: 16 }} />
                                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {doctor.fullAddress}
                                  </Typography>
                                </Box>
                                
                                {doctor.phone && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Phone sx={{ color: '#7B42F6', fontSize: 16 }} />
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                      {doctor.phone}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {doctor.organizationName && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Business sx={{ color: '#7B42F6', fontSize: 16 }} />
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                      {doctor.organizationName}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </DataReveal>
                          )}
                        </AnimatePresence>
                        
                        {selectedIndex !== index && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {doctor.city}, {doctor.state}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </DoctorCard>
                ))
              ) : (
                !loading && search.length >= 2 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    {error ? (
                      <Typography sx={{ color: '#ff6b6b' }}>{error}</Typography>
                    ) : (
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        No doctors found. Try a different search.
                      </Typography>
                    )}
                  </Box>
                )
              )}
            </Box>
          </NPIDropdown>
        )}
      </AnimatePresence>
    </NPIInputContainer>
  );
};