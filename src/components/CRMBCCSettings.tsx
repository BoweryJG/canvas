import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth';
import { supabase } from '../auth/supabase';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

interface CRMExample {
  name: string;
  format: string;
  color: string;
}

const CRM_EXAMPLES: CRMExample[] = [
  { name: 'HubSpot', format: 'bcc@forward.hubspot.com', color: '#ff7a59' },
  { name: 'Salesforce', format: 'your-email@your-company.com.salesforce.com', color: '#00a1e0' },
  { name: 'Pipedrive', format: 'bcc@pipedrivemail.com', color: '#00cc61' },
  { name: 'Monday.com', format: 'pulse-12345678@boards.monday.com', color: '#ff3d57' },
  { name: 'Zoho', format: 'dropbox.12345@zohomail.com', color: '#e42527' }
];

export const CRMBCCSettings: React.FC = () => {
  const { user } = useAuth();
  const [bccEmail, setBccEmail] = useState('');
  const [originalBccEmail, setOriginalBccEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const loadBccEmail = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('crm_bcc_email')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data?.crm_bcc_email) {
        setBccEmail(data.crm_bcc_email);
        setOriginalBccEmail(data.crm_bcc_email);
      }
    } catch (error) {
      console.error('Error loading BCC email:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBccEmail();
    }
  }, [user, loadBccEmail]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          crm_bcc_email: bccEmail.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setOriginalBccEmail(bccEmail.trim());
      setMessage({ 
        type: 'success', 
        text: 'CRM BCC email saved! All your magic link emails will now copy to your CRM.' 
      });
    } catch (error) {
      console.error('Error saving BCC email:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setBccEmail('');
  };

  const hasChanges = bccEmail !== originalBccEmail;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon /> CRM Email Integration
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Add your CRM's BCC email address to automatically log all outreach in your CRM system.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="CRM BCC Email Address"
          placeholder="e.g., bcc@forward.hubspot.com"
          value={bccEmail}
          onChange={(e) => setBccEmail(e.target.value)}
          variant="outlined"
          helperText="This email will be BCC'd on all your magic link emails"
          InputProps={{
            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !hasChanges || !bccEmail.trim()}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
            }
          }}
        >
          {saving ? 'Saving...' : 'Save BCC Email'}
        </Button>
        
        {bccEmail && (
          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Clear
          </Button>
        )}
      </Box>

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Box sx={{ 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: 2, 
        p: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon fontSize="small" /> Common CRM BCC Formats
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {CRM_EXAMPLES.map((crm) => (
            <Tooltip key={crm.name} title={`Example: ${crm.format}`} arrow>
              <Chip
                label={crm.name}
                size="small"
                sx={{
                  backgroundColor: `${crm.color}20`,
                  borderColor: crm.color,
                  border: '1px solid',
                  cursor: 'help',
                  '&:hover': {
                    backgroundColor: `${crm.color}30`,
                  }
                }}
              />
            </Tooltip>
          ))}
        </Box>
        
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
          Find your CRM's BCC address in your CRM settings under "Email Integration" or "Email Dropbox"
        </Typography>
      </Box>

      <Box sx={{ 
        mt: 3, 
        p: 2, 
        background: 'rgba(0,255,136,0.1)', 
        borderRadius: 2,
        border: '1px solid rgba(0,255,136,0.3)'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          💡 How it works:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          When you send emails through Canvas AI's magic links, your CRM's BCC address will be automatically included. 
          This creates a complete activity log in your CRM without any manual work!
        </Typography>
      </Box>
    </Box>
  );
};