/**
 * Magic Link Analytics Dashboard
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tooltip,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility,
  Download,
  TrendingUp,
  Share,
  ContentCopy,
  Block,
  Refresh,
  AccessTime
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getShareAnalytics, revokeMagicLink } from '../lib/magicLinkGenerator';
import { type MagicLink, type SubscriptionTier, MAGIC_LINK_CONFIGS } from '../types/magicLink';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  userId: string;
  userTier: SubscriptionTier;
}

// Styled components
const DashboardContainer = styled(Box)`
  padding: 24px;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  min-height: 100vh;
`;

const MetricCard = styled(Paper)`
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 255, 198, 0.1);
  }
`;

const MetricValue = styled(Typography)`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00FFC6, #00D4FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LinkRow = styled(TableRow)`
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const StyledTab = styled(Tab)`
  color: rgba(255, 255, 255, 0.6);
  
  &.Mui-selected {
    color: #00FFC6;
  }
`;

const ChartContainer = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface AnalyticsData {
  links: MagicLink[];
  totalViews: number;
  totalDownloads: number;
  activeLinks: number;
  avgEngagementTime: number;
  topPerformingLink: MagicLink | null;
  viewsByDay: { date: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

export default function MagicLinkAnalytics({ userId, userTier }: Props) {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('30d');
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [linkToRevoke, setLinkToRevoke] = useState<string | null>(null);
  
  const config = MAGIC_LINK_CONFIGS[userTier];
  const hasAnalytics = config.features.includes('analytics_basic') || config.features.includes('analytics_full');
  const hasFullAnalytics = config.features.includes('analytics_full');
  
  useEffect(() => {
    if (hasAnalytics) {
      fetchAnalytics();
    }
  }, [userId, timeFilter]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const links = await getShareAnalytics(userId);
      
      // Process analytics data
      const now = new Date();
      const timeFilterMs = timeFilter === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                          timeFilter === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                          Infinity;
      
      const filteredLinks = links.filter((link: any) => {
        const createdAt = new Date(link.created_at);
        return (now.getTime() - createdAt.getTime()) <= timeFilterMs;
      });
      
      // Calculate metrics
      const totalViews = filteredLinks.reduce((sum: number, link: any) => sum + (link.views || 0), 0);
      const totalDownloads = filteredLinks.reduce((sum: number, link: any) => sum + (link.downloads || 0), 0);
      const activeLinks = filteredLinks.filter((link: any) => 
        new Date(link.expires_at) > now && !link.revoked_at
      ).length;
      
      // Find top performing link
      const topPerformingLink = filteredLinks.reduce((top: any, link: any) => 
        (link.views || 0) > (top?.views || 0) ? link : top
      , null);
      
      // Create views by day data
      const viewsByDay: { [key: string]: number } = {};
      filteredLinks.forEach((link: any) => {
        if (link.magic_link_analytics) {
          link.magic_link_analytics
            .filter((event: any) => event.event_type === 'view')
            .forEach((event: any) => {
              const date = new Date(event.created_at).toLocaleDateString();
              viewsByDay[date] = (viewsByDay[date] || 0) + 1;
            });
        }
      });
      
      const viewsByDayArray = Object.entries(viewsByDay)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Device breakdown (mock data for now)
      const deviceBreakdown = [
        { device: 'Desktop', count: Math.floor(totalViews * 0.6) },
        { device: 'Mobile', count: Math.floor(totalViews * 0.3) },
        { device: 'Tablet', count: Math.floor(totalViews * 0.1) }
      ];
      
      setAnalyticsData({
        links: filteredLinks,
        totalViews,
        totalDownloads,
        activeLinks,
        avgEngagementTime: 3.5, // Mock data
        topPerformingLink,
        viewsByDay: viewsByDayArray,
        deviceBreakdown
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevoke = async () => {
    if (!linkToRevoke) return;
    
    try {
      const result = await revokeMagicLink(linkToRevoke, userId);
      if (result.success) {
        fetchAnalytics();
        setShowRevokeDialog(false);
        setLinkToRevoke(null);
      }
    } catch (error) {
      console.error('Error revoking link:', error);
    }
  };
  
  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/intel/${linkId}`;
    navigator.clipboard.writeText(url);
  };
  
  if (!hasAnalytics) {
    return (
      <DashboardContainer>
        <Alert 
          severity="info"
          sx={{ 
            maxWidth: 600,
            mx: 'auto',
            bgcolor: 'rgba(0, 212, 255, 0.1)',
            color: '#00D4FF'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Analytics Available in Starter Plan
          </Typography>
          <Typography>
            Upgrade to Starter or higher to access detailed analytics for your shared intelligence reports.
          </Typography>
          <Button 
            variant="contained"
            sx={{ 
              mt: 2,
              background: 'linear-gradient(135deg, #00FFC6, #00D4FF)',
              color: '#000'
            }}
          >
            Upgrade Now
          </Button>
        </Alert>
      </DashboardContainer>
    );
  }
  
  if (loading) {
    return (
      <DashboardContainer>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress sx={{ maxWidth: 400, mx: 'auto', mb: 2 }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Loading analytics...
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Share Analytics
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Track the performance of your shared intelligence reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="all">All time</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchAnalytics} sx={{ color: 'rgba(255,255,255,0.6)' }}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      {/* Metrics Overview */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: 280 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MetricCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Visibility sx={{ color: '#00FFC6' }} />
                <TrendingUp sx={{ color: '#00FFC6', fontSize: 16 }} />
              </Box>
              <MetricValue>{analyticsData?.totalViews || 0}</MetricValue>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Total Views
              </Typography>
            </MetricCard>
          </motion.div>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: 280 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MetricCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Download sx={{ color: '#00D4FF' }} />
                <Chip 
                  label="+12%" 
                  size="small"
                  sx={{ bgcolor: 'rgba(0,212,255,0.2)', color: '#00D4FF' }}
                />
              </Box>
              <MetricValue>{analyticsData?.totalDownloads || 0}</MetricValue>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Downloads
              </Typography>
            </MetricCard>
          </motion.div>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: 280 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MetricCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Share sx={{ color: '#9F58FA' }} />
              </Box>
              <MetricValue>{analyticsData?.activeLinks || 0}</MetricValue>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Active Links
              </Typography>
            </MetricCard>
          </motion.div>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(25% - 24px)', minWidth: 280 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MetricCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <AccessTime sx={{ color: '#FFD700' }} />
              </Box>
              <MetricValue>
                {analyticsData?.avgEngagementTime.toFixed(1)}m
              </MetricValue>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Avg. Time Spent
              </Typography>
            </MetricCard>
          </motion.div>
        </Box>
      </Box>
      
      {/* Charts Section (Professional+) */}
      {hasFullAnalytics && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 calc(66.66% - 12px)', minWidth: 400 }}>
            <MetricCard>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Views Over Time
              </Typography>
              <ChartContainer>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  Chart visualization would go here
                </Typography>
              </ChartContainer>
            </MetricCard>
          </Box>
          
          <Box sx={{ flex: '1 1 calc(33.33% - 12px)', minWidth: 300 }}>
            <MetricCard>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Device Breakdown
              </Typography>
              <ChartContainer>
                <Box>
                  {analyticsData?.deviceBreakdown.map((device) => (
                    <Box key={device.device} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{device.device}</Typography>
                        <Typography variant="body2">{device.count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(device.count / (analyticsData?.totalViews || 1)) * 100}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #00FFC6, #00D4FF)'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </ChartContainer>
            </MetricCard>
          </Box>
        </Box>
      )}
      
      {/* Links Table */}
      <MetricCard>
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3 }}
        >
          <StyledTab label="All Links" />
          <StyledTab label="Active Links" />
          <StyledTab label="Expired Links" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="center">Views</TableCell>
                <TableCell align="center">Downloads</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData?.links
                .filter((link: any) => {
                  if (activeTab === 0) return true;
                  const isActive = new Date(link.expires_at) > new Date() && !link.revoked_at;
                  return activeTab === 1 ? isActive : !isActive;
                })
                .map((link: any) => (
                  <LinkRow key={link.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {link.doctor_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {new Date(link.expires_at) > new Date() 
                        ? formatDistanceToNow(new Date(link.expires_at), { addSuffix: true })
                        : 'Expired'
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={link.views || 0}
                        size="small"
                        sx={{ bgcolor: 'rgba(0,255,198,0.2)' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={link.downloads || 0}
                        size="small"
                        sx={{ bgcolor: 'rgba(0,212,255,0.2)' }}
                      />
                    </TableCell>
                    <TableCell>
                      {link.revoked_at ? (
                        <Chip 
                          label="Revoked" 
                          size="small"
                          sx={{ bgcolor: 'rgba(255,107,107,0.2)', color: '#ff6b6b' }}
                        />
                      ) : new Date(link.expires_at) > new Date() ? (
                        <Chip 
                          label="Active" 
                          size="small"
                          sx={{ bgcolor: 'rgba(0,255,198,0.2)', color: '#00FFC6' }}
                        />
                      ) : (
                        <Chip 
                          label="Expired" 
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Copy link">
                        <IconButton 
                          size="small"
                          onClick={() => copyLink(link.id)}
                          sx={{ color: 'rgba(255,255,255,0.6)' }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!link.revoked_at && new Date(link.expires_at) > new Date() && (
                        <Tooltip title="Revoke link">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setLinkToRevoke(link.id);
                              setShowRevokeDialog(true);
                            }}
                            sx={{ color: 'rgba(255,107,107,0.8)' }}
                          >
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </LinkRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MetricCard>
      
      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onClose={() => setShowRevokeDialog(false)}>
        <DialogTitle>Revoke Share Link?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke this share link? Recipients will no longer be able to access the report.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRevokeDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRevoke}
            color="error"
            variant="contained"
          >
            Revoke Link
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
}