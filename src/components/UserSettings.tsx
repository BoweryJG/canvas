import React, { useState } from 'react';
import { useAuth } from '../auth';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import { CRMBCCSettings } from './CRMBCCSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Please log in to access settings</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon sx={{ fontSize: 32, color: '#00ff88' }} />
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
      </Box>

      <Paper sx={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#00ff88',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00ff88',
              }
            }}
          >
            <Tab 
              label="Profile" 
              icon={<PersonIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Email Integration" 
              icon={<EmailIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Integrations" 
              icon={<IntegrationInstructionsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Profile Information</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Email
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Name
              </Typography>
              <Typography>{user.user_metadata?.full_name || 'Not set'}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Company
              </Typography>
              <Typography>{user.user_metadata?.company || 'Not set'}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Member Since
              </Typography>
              <Typography>
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CRMBCCSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Connected Integrations</Typography>
            
            <Box sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 2,
              textAlign: 'center',
              border: '1px dashed rgba(255, 255, 255, 0.2)'
            }}>
              <IntegrationInstructionsIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                CRM integrations coming soon!
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                Direct integrations with Salesforce, HubSpot, and more are on the way.
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};