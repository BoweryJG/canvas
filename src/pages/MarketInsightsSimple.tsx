/**
 * Market Insights Page - Simplified version
 * Displays real-time medical market intelligence and analytics
 */

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { 
  TrendingUp, 
  ShowChart, 
  LocalHospital,
  LocationOn,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Remove
} from '@mui/icons-material';
import { marketInsightsService, type MarketInsight, type ProcedureData, type TerritoryMetrics } from '../lib/marketInsights';
import { motion } from 'framer-motion';
import { useAuth } from '../auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const specialties = [
  'All Specialties',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Oncology',
  'Radiology'
];

const territories = [
  'United States',
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West Coast'
];

export default function MarketInsightsSimple() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedTerritory, setSelectedTerritory] = useState('United States');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [marketOverview, setMarketOverview] = useState<MarketInsight[]>([]);
  const [procedureVolumes, setProcedureVolumes] = useState<ProcedureData[]>([]);
  const [territoryMetrics, setTerritoryMetrics] = useState<TerritoryMetrics | null>(null);
  const [trendingInsights, setTrendingInsights] = useState<MarketInsight[]>([]);
  
  const { user } = useAuth();
  const userTier = user?.subscription?.tier || 'free';

  useEffect(() => {
    loadData();
  }, [selectedSpecialty, selectedTerritory]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [overview, trending, territory] = await Promise.all([
        marketInsightsService.getMarketOverview(
          selectedSpecialty === 'All Specialties' ? undefined : selectedSpecialty,
          selectedTerritory
        ),
        marketInsightsService.getTrendingInsights(
          selectedSpecialty === 'All Specialties' ? undefined : selectedSpecialty
        ),
        marketInsightsService.getTerritoryMetrics(selectedTerritory)
      ]);

      setMarketOverview(overview);
      setTrendingInsights(trending);
      setTerritoryMetrics(territory);

      // Load procedure volumes if specific specialty selected
      if (selectedSpecialty !== 'All Specialties') {
        const procedures = await marketInsightsService.getProcedureVolumes(selectedSpecialty, selectedTerritory);
        setProcedureVolumes(procedures);
      }
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpward sx={{ fontSize: 16, color: '#00ffc6' }} />;
    if (trend === 'down') return <ArrowDownward sx={{ fontSize: 16, color: '#ff4444' }} />;
    return <Remove sx={{ fontSize: 16, color: '#888' }} />;
  };

  const formatMetric = (metric: string | number): string => {
    if (typeof metric === 'number') {
      if (metric >= 1000000) return `${(metric / 1000000).toFixed(1)}M`;
      if (metric >= 1000) return `${(metric / 1000).toFixed(1)}K`;
      return metric.toFixed(0);
    }
    return metric;
  };

  const renderMarketOverview = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {loading ? (
        [1, 2, 3, 4].map(i => (
          <Box key={i} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Box>
        ))
      ) : (
        marketOverview.map((insight, index) => (
          <Box key={insight.id} sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#00ffc6',
                  boxShadow: '0 10px 30px rgba(0, 255, 198, 0.2)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {insight.title}
                    </Typography>
                    {insight.trend && getTrendIcon(insight.trend)}
                  </Box>
                  
                  <Typography variant="h3" sx={{ 
                    color: '#00ffc6',
                    fontWeight: 700,
                    mb: 1
                  }}>
                    {formatMetric(insight.metric)}
                    {insight.change && (
                      <Typography component="span" sx={{ 
                        fontSize: '0.5em',
                        ml: 1,
                        color: insight.change > 0 ? '#00ffc6' : '#ff4444'
                      }}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </Typography>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {insight.details}
                  </Typography>
                  
                  {insight.source && (
                    <Typography variant="caption" sx={{ 
                      display: 'block',
                      mt: 2,
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      Source: {new URL(insight.source).hostname}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        ))
      )}
    </Box>
  );

  const renderProcedureVolumes = () => (
    <Box>
      {loading ? (
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      ) : procedureVolumes.length === 0 ? (
        <Paper sx={{
          p: 4,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Select a specific specialty to view procedure volumes
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {procedureVolumes.slice(0, 10).map((procedure, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Paper sx={{
                p: 2,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  borderColor: '#00ffc6',
                  background: 'rgba(255, 255, 255, 0.05)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {procedure.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {procedure.specialty}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{ color: '#00ffc6', fontWeight: 700 }}>
                      {formatMetric(procedure.volume)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {procedure.growthRate > 0 ? (
                        <ArrowUpward sx={{ fontSize: 14, color: '#00ffc6' }} />
                      ) : (
                        <ArrowDownward sx={{ fontSize: 14, color: '#ff4444' }} />
                      )}
                      <Typography variant="caption" sx={{ 
                        color: procedure.growthRate > 0 ? '#00ffc6' : '#ff4444'
                      }}>
                        {Math.abs(procedure.growthRate)}% YoY
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {procedure.reimbursement && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Avg. Reimbursement: ${formatMetric(procedure.reimbursement)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderTrendingInsights = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {loading ? (
        [1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        ))
      ) : (
        trendingInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Paper sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderLeft: '4px solid #00ffc6',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
                transform: 'translateX(5px)'
              },
              transition: 'all 0.3s ease'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {insight.details}
                  </Typography>
                </Box>
                <Chip 
                  label="TRENDING"
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                    color: '#fff',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        ))
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ pt: 12, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              color: '#fff',
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(90deg, #fff 0%, #00ffc6 50%, #7B42F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%',
            }}>
              Market Insights
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Real-time medical market intelligence and analytics
            </Typography>
          </Box>
          
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                color: '#00ffc6',
                border: '1px solid rgba(0, 255, 198, 0.3)',
                '&:hover': {
                  background: 'rgba(0, 255, 198, 0.1)',
                  borderColor: '#00ffc6'
                }
              }}
            >
              <Refresh className={refreshing ? 'spinning' : ''} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Specialty</InputLabel>
            <Select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              label="Specialty"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 255, 198, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00ffc6'
                }
              }}
            >
              {specialties.map(specialty => (
                <MenuItem key={specialty} value={specialty}>{specialty}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Territory</InputLabel>
            <Select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              label="Territory"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 255, 198, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00ffc6'
                }
              }}
            >
              {territories.map(territory => (
                <MenuItem key={territory} value={territory}>{territory}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Territory Summary */}
        {territoryMetrics && (
          <Box sx={{ 
            p: 3,
            mb: 3,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2
          }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 25%', minWidth: '200px', textAlign: 'center' }}>
                <LocationOn sx={{ fontSize: 40, color: '#00ffc6', mb: 1 }} />
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                  {territoryMetrics.territory}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Selected Territory
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 25%', minWidth: '200px', textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#00ffc6', fontWeight: 700 }}>
                  {formatMetric(territoryMetrics.totalProcedures)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Total Procedures
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 25%', minWidth: '200px', textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#7B42F6', fontWeight: 700 }}>
                  {territoryMetrics.growthRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Growth Rate
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 25%', minWidth: '200px', textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                  {territoryMetrics.marketPotential}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Market Score
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={territoryMetrics.marketPotential} 
                  sx={{ 
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Loading indicator */}
        {(loading || refreshing) && (
          <LinearProgress sx={{ 
            mb: 2,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)'
            }
          }} />
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 600,
              '&.Mui-selected': {
                color: '#00ffc6'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00ffc6'
            }
          }}
        >
          <Tab label="Market Overview" icon={<ShowChart />} iconPosition="start" />
          <Tab label="Procedure Volumes" icon={<LocalHospital />} iconPosition="start" />
          <Tab label="Trending Now" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {renderMarketOverview()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderProcedureVolumes()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderTrendingInsights()}
      </TabPanel>

      {/* Pro Upgrade CTA for free users */}
      {userTier === 'free' && (
        <Box sx={{ 
          mt: 6,
          p: 4,
          background: 'linear-gradient(135deg, rgba(123, 66, 246, 0.1) 0%, rgba(0, 255, 198, 0.1) 100%)',
          border: '2px solid rgba(0, 255, 198, 0.3)',
          borderRadius: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
            Unlock Advanced Market Intelligence
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            Get deeper insights, competitor tracking, and real-time alerts with Canvas Pro
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="Real-time competitor tracking" sx={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }} />
            <Chip label="Custom territory analysis" sx={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }} />
            <Chip label="Procedure trend predictions" sx={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }} />
            <Chip label="Export reports" sx={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }} />
          </Box>
        </Box>
      )}
    </Container>
  );
}