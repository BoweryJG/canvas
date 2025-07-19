import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useUnifiedSubscription } from '../../auth/useUnifiedSubscription';
import { UnifiedSubscription } from '../../services/subscriptionService';

interface UnifiedPricingModalProps {
  open: boolean;
  onClose: () => void;
  currentTier?: string;
  showRepXOnly?: boolean;
}

export const UnifiedPricingModal: React.FC<UnifiedPricingModalProps> = ({
  open,
  onClose,
  currentTier = 'free',
  showRepXOnly = false
}) => {
  const { repxPlans, createRepXCheckout, loading } = useUnifiedSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleBillingCycleChange = (
    event: React.MouseEvent<HTMLElement>,
    newBillingCycle: 'monthly' | 'annual' | null,
  ) => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  const handleSubscribe = async (tier: string) => {
    setSubscribing(tier);
    try {
      await createRepXCheckout(tier, billingCycle);
    } catch (error) {
      console.error('Failed to create checkout:', error);
      alert('Failed to start subscription process. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const getSavings = (plan: UnifiedSubscription) => {
    const monthlyTotal = (plan.monthly.amount / 100) * 12;
    const annualPrice = plan.annual.amount / 100;
    const savings = monthlyTotal - annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { savings, percentage };
  };

  if (loading || !repxPlans) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading subscription plans...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box textAlign="center">
          <Typography variant="h4" component="h2" gutterBottom>
            {showRepXOnly ? 'RepX Enhancement Levels' : 'Unified Subscription Plans'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {showRepXOnly 
              ? 'Professional calling, email integration, and Canvas intelligence'
              : 'Access all RepSpheres services with one subscription'
            }
          </Typography>
          
          {/* Billing Toggle */}
          <Box display="flex" justifyContent="center" mt={2}>
            <ToggleButtonGroup
              color="primary"
              value={billingCycle}
              exclusive
              onChange={handleBillingCycleChange}
              aria-label="billing cycle"
            >
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="annual">
                Annual
                <Chip size="small" label="Save up to 17%" color="success" sx={{ ml: 1 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {Object.entries(repxPlans).map(([tierKey, plan]) => {
            const isCurrentTier = tierKey === currentTier;
            const isPopular = tierKey === 'repx2';
            const savings = getSavings(plan);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={tierKey}>
                <Card 
                  elevation={isPopular ? 8 : 2}
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: isPopular ? 2 : 0,
                    borderColor: 'primary.main',
                    transform: isPopular ? 'scale(1.05)' : 'none'
                  }}
                >
                  {isPopular && (
                    <Chip
                      label="MOST POPULAR"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h5" component="h3">
                        {plan.name}
                      </Typography>
                      {isPopular && <StarIcon color="primary" />}
                    </Box>
                    
                    <Typography variant="h3" component="div" gutterBottom>
                      ${plan[billingCycle].amount / 100}
                      <Typography component="span" variant="body1" color="text.secondary">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </Typography>
                    </Typography>
                    
                    {billingCycle === 'annual' && savings.savings > 0 && (
                      <Typography variant="body2" color="success.main" gutterBottom>
                        Save ${savings.savings.toFixed(0)}/year ({savings.percentage}% off)
                      </Typography>
                    )}
                    
                    {/* Feature Limits */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        • {plan.features.calls === 'unlimited' ? 'Unlimited' : plan.features.calls} calls/month
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • {plan.features.emails === 'unlimited' ? 'Unlimited' : plan.features.emails} emails/day
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • {plan.features.canvas_scans === 'unlimited' ? 'Unlimited' : plan.features.canvas_scans} Canvas scans/day
                      </Typography>
                    </Box>
                    
                    {/* Features List */}
                    <List dense>
                      {plan.features.basic.slice(0, 4).map((feature, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                      
                      {plan.features.premium && plan.features.premium.length > 0 && (
                        plan.features.premium.slice(0, 2).map((feature, index) => (
                          <ListItem key={`premium-${index}`} disableGutters>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <StarIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      fullWidth
                      variant={isPopular ? "contained" : "outlined"}
                      color={isPopular ? "primary" : "inherit"}
                      disabled={subscribing === tierKey || isCurrentTier}
                      onClick={() => handleSubscribe(tierKey)}
                      sx={{ m: 1 }}
                    >
                      {subscribing === tierKey ? (
                        <CircularProgress size={24} />
                      ) : isCurrentTier ? (
                        'Current Plan'
                      ) : (
                        `Get ${tierKey.toUpperCase()}`
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            30-day money-back guarantee • Cancel anytime • No questions asked
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};