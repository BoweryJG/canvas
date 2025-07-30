import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext_20250730';
import { FeatureGate, TierBadge, UpgradePrompt, RepXTier } from '../unified-auth';

interface ResearchQuery {
  query: string;
  timestamp: Date;
  results?: any;
}

export const EnhancedResearchPanel_20250730: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [searchesToday, setSearchesToday] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { tier, canUseResearchTools, getResearchLimit } = useUnifiedAuth();
  const researchLimit = getResearchLimit();
  const hasLimit = researchLimit !== null;
  const percentUsed = hasLimit ? (searchesToday / researchLimit) * 100 : 0;
  
  // Load today's search count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('canvas_research_usage');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.date === today) {
        setSearchesToday(data.count);
      } else {
        // New day, reset count
        localStorage.setItem('canvas_research_usage', JSON.stringify({ date: today, count: 0 }));
        setSearchesToday(0);
      }
    }
  }, []);
  
  const handleSearch = async () => {
    if (!canUseResearchTools()) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (hasLimit && searchesToday >= researchLimit) {
      alert(`Daily research limit reached (${researchLimit} searches). Please upgrade for more.`);
      setShowUpgradeModal(true);
      return;
    }
    
    setLoading(true);
    try {
      // Simulate research API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update search count
      const newCount = searchesToday + 1;
      setSearchesToday(newCount);
      const today = new Date().toDateString();
      localStorage.setItem('canvas_research_usage', JSON.stringify({ date: today, count: newCount }));
      
      // Mock results
      setResults({
        query,
        insights: [
          'Market opportunity identified in dental implant sector',
          'Key competitor analysis complete',
          'Target practice profiles generated'
        ],
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h5">Sales Intelligence Research</Typography>
            <TierBadge tier={tier} />
          </Box>
          <Tooltip title="Research tools help you find market opportunities and analyze competitors">
            <IconButton size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <FeatureGate
          feature="emailAccess"
          fallback={
            <Alert severity="info" sx={{ mb: 3 }}>
              Research tools require RepX² Professional or higher.
              <Box mt={1}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade to Access Research
                </Button>
              </Box>
            </Alert>
          }
        >
          {hasLimit && (
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Daily Research Usage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchesToday} / {researchLimit} searches
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={percentUsed} 
                color={percentUsed > 80 ? "warning" : "primary"}
              />
            </Box>
          )}
          
          {!hasLimit && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Unlimited research available with your {tier} plan!
            </Alert>
          )}
          
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter research query (e.g., 'dental implant practices in New York')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={loading || !query}
            >
              Research
            </Button>
          </Box>
          
          {results && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Research Results
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Query: "{results.query}"
                </Typography>
                <Box display="flex" flexDirection="column" gap={1} mt={2}>
                  {results.insights.map((insight: string, index: number) => (
                    <Chip 
                      key={index}
                      label={insight}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                  Generated at {new Date(results.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          )}
        </FeatureGate>
      </Paper>
      
      {showUpgradeModal && (
        <UpgradePrompt
          currentTier={tier}
          requiredTier={RepXTier.Rep2}
          feature="Research Tools"
          onUpgrade={() => {
            window.location.href = 'https://osbackend-zl1h.onrender.com/upgrade?feature=research&from=' + tier;
          }}
          onCancel={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
};