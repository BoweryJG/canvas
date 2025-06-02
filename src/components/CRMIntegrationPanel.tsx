import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  type CRMConfig, 
  type CRMIntegrationMetrics,
  createCRMIntegration,
  defaultCRMConfigs,
  checkCRMIntegrationStatus
} from '../lib/crmIntegration';

interface CRMIntegrationPanelProps {
  onConfigChange?: (configs: CRMConfig[]) => void;
}

const CRMIntegrationPanel: React.FC<CRMIntegrationPanelProps> = ({ onConfigChange }) => {
  const [configs, setConfigs] = useState<CRMConfig[]>([
    { ...defaultCRMConfigs.salesforce, provider: 'salesforce', enabled: false },
    { ...defaultCRMConfigs.hubspot, provider: 'hubspot', enabled: false },
    { ...defaultCRMConfigs.pipedrive, provider: 'pipedrive', enabled: false },
    { ...defaultCRMConfigs.zoho, provider: 'zoho', enabled: false },
    { ...defaultCRMConfigs.custom, provider: 'custom', enabled: false }
  ]);

  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const [testingConnections, setTestingConnections] = useState<Record<string, boolean>>({});
  const [metrics, setMetrics] = useState<Record<string, CRMIntegrationMetrics>>({});
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load saved configs from localStorage
    const savedConfigs = localStorage.getItem('canvas_crm_configs');
    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        setConfigs(parsed);
      } catch (error) {
        console.error('Failed to load CRM configs:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save configs to localStorage
    localStorage.setItem('canvas_crm_configs', JSON.stringify(configs));
    onConfigChange?.(configs);
  }, [configs, onConfigChange]);

  const updateConfig = useCallback((provider: string, updates: Partial<CRMConfig>) => {
    setConfigs(prev => prev.map(config => 
      config.provider === provider 
        ? { ...config, ...updates }
        : config
    ));
  }, []);

  const testConnection = useCallback(async (provider: string) => {
    setTestingConnections(prev => ({ ...prev, [provider]: true }));
    
    try {
      const config = configs.find(c => c.provider === provider);
      if (!config) return;

      const manager = createCRMIntegration(config);
      const isConnected = await manager.testConnection();
      
      setConnectionStatus(prev => ({ ...prev, [provider]: isConnected }));
      
      if (isConnected) {
        const crmMetrics = manager.getMetrics();
        setMetrics(prev => ({ ...prev, [provider]: crmMetrics }));
      }
    } catch (error) {
      console.error(`CRM connection test failed for ${provider}:`, error);
      setConnectionStatus(prev => ({ ...prev, [provider]: false }));
    } finally {
      setTestingConnections(prev => ({ ...prev, [provider]: false }));
    }
  }, [configs]);

  const testAllConnections = useCallback(async () => {
    const enabledConfigs = configs.filter(c => c.enabled);
    const status = await checkCRMIntegrationStatus(enabledConfigs);
    setConnectionStatus(status);
  }, [configs]);

  const toggleAdvanced = useCallback((provider: string) => {
    setShowAdvanced(prev => ({ ...prev, [provider]: !prev[provider] }));
  }, []);

  const renderProviderCard = (config: CRMConfig) => {
    const isConnected = connectionStatus[config.provider];
    const isTesting = testingConnections[config.provider];
    const providerMetrics = metrics[config.provider];
    const isAdvanced = showAdvanced[config.provider];

    const providerInfo = {
      salesforce: {
        name: 'Salesforce',
        icon: '☁️',
        color: '#00A1E0',
        description: 'World\'s #1 CRM platform'
      },
      hubspot: {
        name: 'HubSpot',
        icon: '🔶',
        color: '#FF7A59',
        description: 'Inbound marketing & sales platform'
      },
      pipedrive: {
        name: 'Pipedrive',
        icon: '🔵',
        color: '#1976D2',
        description: 'Sales pipeline management'
      },
      zoho: {
        name: 'Zoho CRM',
        icon: '🟠',
        color: '#FFA726',
        description: 'Complete business suite'
      },
      custom: {
        name: 'Custom CRM',
        icon: '🔧',
        color: '#9C27B0',
        description: 'Custom API integration'
      }
    };

    const info = providerInfo[config.provider as keyof typeof providerInfo];

    return (
      <motion.div
        key={config.provider}
        className="crm-provider-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Object.keys(providerInfo).indexOf(config.provider) * 0.1 }}
      >
        <div className="provider-header">
          <div className="provider-info">
            <span className="provider-icon" style={{ color: info.color }}>
              {info.icon}
            </span>
            <div>
              <h4 className="provider-name">{info.name}</h4>
              <p className="provider-description">{info.description}</p>
            </div>
          </div>
          
          <div className="provider-controls">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => updateConfig(config.provider, { enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
            
            {config.enabled && (
              <div className="connection-status">
                {isTesting ? (
                  <span className="status-testing">🔄 Testing...</span>
                ) : isConnected ? (
                  <span className="status-connected">✅ Connected</span>
                ) : (
                  <span className="status-disconnected">❌ Disconnected</span>
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {config.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="provider-config"
            >
              <div className="config-section">
                <h5>Configuration</h5>
                
                {config.provider === 'salesforce' && (
                  <>
                    <div className="input-group">
                      <label>Instance URL</label>
                      <input
                        type="url"
                        placeholder="https://yourinstance.salesforce.com"
                        value={config.instanceUrl || ''}
                        onChange={(e) => updateConfig(config.provider, { instanceUrl: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>API Token</label>
                      <input
                        type="password"
                        placeholder="Your Salesforce API token"
                        value={config.apiToken || ''}
                        onChange={(e) => updateConfig(config.provider, { apiToken: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {config.provider === 'hubspot' && (
                  <>
                    <div className="input-group">
                      <label>Hub ID</label>
                      <input
                        type="text"
                        placeholder="Your HubSpot Hub ID"
                        value={config.hubId || ''}
                        onChange={(e) => updateConfig(config.provider, { hubId: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        placeholder="Your HubSpot API key"
                        value={config.apiKey || ''}
                        onChange={(e) => updateConfig(config.provider, { apiKey: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {config.provider === 'pipedrive' && (
                  <>
                    <div className="input-group">
                      <label>Domain</label>
                      <input
                        type="text"
                        placeholder="yourcompany"
                        value={config.domain || ''}
                        onChange={(e) => updateConfig(config.provider, { domain: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>API Token</label>
                      <input
                        type="password"
                        placeholder="Your Pipedrive API token"
                        value={config.apiToken || ''}
                        onChange={(e) => updateConfig(config.provider, { apiToken: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {config.provider === 'zoho' && (
                  <>
                    <div className="input-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        placeholder="Your Zoho API key"
                        value={config.apiKey || ''}
                        onChange={(e) => updateConfig(config.provider, { apiKey: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {config.provider === 'custom' && (
                  <>
                    <div className="input-group">
                      <label>Custom Endpoint</label>
                      <input
                        type="url"
                        placeholder="https://your-crm-api.com/webhook"
                        value={config.customEndpoint || ''}
                        onChange={(e) => updateConfig(config.provider, { customEndpoint: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        placeholder="Your custom API key"
                        value={config.apiKey || ''}
                        onChange={(e) => updateConfig(config.provider, { apiKey: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="config-actions">
                <button
                  onClick={() => testConnection(config.provider)}
                  disabled={isTesting}
                  className="test-btn"
                >
                  {isTesting ? '🔄 Testing...' : '🔌 Test Connection'}
                </button>
                
                <button
                  onClick={() => toggleAdvanced(config.provider)}
                  className="advanced-btn"
                >
                  ⚙️ {isAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
              </div>

              <AnimatePresence>
                {isAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="advanced-config"
                  >
                    <h5>Advanced Settings</h5>
                    
                    <div className="advanced-options">
                      <label>
                        <input type="checkbox" />
                        Sync opportunities automatically
                      </label>
                      <label>
                        <input type="checkbox" />
                        Create follow-up tasks
                      </label>
                      <label>
                        <input type="checkbox" />
                        Update existing contacts
                      </label>
                      <label>
                        <input type="checkbox" />
                        Enable bi-directional sync
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {providerMetrics && isConnected && (
                <div className="provider-metrics">
                  <h5>Integration Metrics</h5>
                  <div className="metrics-grid">
                    <div className="metric">
                      <span className="metric-value">{providerMetrics.totalContacts}</span>
                      <span className="metric-label">Contacts Synced</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{providerMetrics.totalOpportunities}</span>
                      <span className="metric-label">Opportunities</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{Math.round(providerMetrics.syncSuccessRate)}%</span>
                      <span className="metric-label">Success Rate</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{providerMetrics.totalActivities}</span>
                      <span className="metric-label">Activities</span>
                    </div>
                  </div>
                  
                  {providerMetrics.lastSyncTime && (
                    <p className="last-sync">
                      Last sync: {new Date(providerMetrics.lastSyncTime).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="crm-integration-panel">
      <div className="panel-header">
        <h3>🔗 CRM Integration</h3>
        <p>Connect Canvas with your favorite CRM platforms to automatically sync leads and opportunities.</p>
        
        <div className="panel-actions">
          <button onClick={testAllConnections} className="test-all-btn">
            🔄 Test All Connections
          </button>
        </div>
      </div>

      <div className="providers-grid">
        {configs.map(config => renderProviderCard(config))}
      </div>

      <div className="integration-summary">
        <h4>Integration Summary</h4>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{configs.filter(c => c.enabled).length}</span>
            <span className="stat-label">Active Integrations</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Object.values(connectionStatus).filter(Boolean).length}</span>
            <span className="stat-label">Connected CRMs</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {Object.values(metrics).reduce((sum, m) => sum + m.totalContacts, 0)}
            </span>
            <span className="stat-label">Total Contacts Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMIntegrationPanel;