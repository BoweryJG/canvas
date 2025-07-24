import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  analyzePracticeSEO, 
  type SEOAnalysis,
  type SEOIssue,
  type SEOOpportunity
} from '../lib/seoAnalysis';
import { CircularProgress } from '@mui/material';

interface SEOReportModalProps {
  open: boolean;
  onClose: () => void;
  websiteUrl: string;
  doctorName: string;
  location?: string;
  specialty?: string;
  userId?: string;
}

type TabKey = 'overview' | 'technical' | 'local' | 'competitors' | 'keywords';

export const SEOReportModal: React.FC<SEOReportModalProps> = ({
  open,
  onClose,
  websiteUrl,
  doctorName,
  location = '',
  specialty = '',
  userId
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const runAnalysis = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzePracticeSEO(
        websiteUrl,
        doctorName,
        location,
        specialty,
        userId
      );
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze SEO');
    } finally {
      setLoading(false);
    }
  }, [websiteUrl, doctorName, location, specialty, userId]);

  // Auto-run analysis when modal opens
  React.useEffect(() => {
    if (open && !analysis && !loading) {
      runAnalysis();
    }
  }, [open, analysis, loading, runAnalysis]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#fbbf24';
    return '#ef4444';
  };

  const getIssueIcon = (type: SEOIssue['type']) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  const getImpactColor = (impact: SEOOpportunity['estimatedImpact']) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#fbbf24';
      case 'low': return '#10b981';
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(0, 255, 198, 0.3)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '1200px',
            height: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '30px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🔍 SEO Analysis Report
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {websiteUrl}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '10px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px'
            }}>
              <CircularProgress size={60} style={{ color: '#00ffc6' }} />
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Analyzing SEO performance...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              padding: '40px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                ❌
              </div>
              <p style={{ color: '#ef4444', fontSize: '18px' }}>
                {error}
              </p>
              <button
                onClick={runAnalysis}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !loading && (
            <>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '10px',
                padding: '20px 30px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                overflowX: 'auto'
              }}>
                {[
                  { key: 'overview', label: '📊 Overview' },
                  { key: 'technical', label: '⚙️ Technical' },
                  { key: 'local', label: '📍 Local SEO' },
                  { key: 'competitors', label: '🏆 Competitors' },
                  { key: 'keywords', label: '🔑 Keywords' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                    style={{
                      padding: '10px 20px',
                      background: activeTab === tab.key 
                        ? 'rgba(0, 255, 198, 0.2)'
                        : 'transparent',
                      color: activeTab === tab.key
                        ? '#00ffc6'
                        : 'rgba(255, 255, 255, 0.7)',
                      border: activeTab === tab.key
                        ? '1px solid rgba(0, 255, 198, 0.3)'
                        : '1px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '30px'
              }}>
                {activeTab === 'overview' && (
                  <div>
                    {/* Score */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '30px',
                      marginBottom: '30px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>
                        Overall SEO Score
                      </h3>
                      <div style={{
                        fontSize: '72px',
                        fontWeight: 700,
                        color: getScoreColor(analysis.score),
                        marginBottom: '10px'
                      }}>
                        {analysis.score}
                      </div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {analysis.score >= 80 && 'Excellent SEO performance'}
                        {analysis.score >= 60 && analysis.score < 80 && 'Good SEO with room for improvement'}
                        {analysis.score < 60 && 'Significant SEO improvements needed'}
                      </p>
                    </div>

                    {/* Issues */}
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                        🚨 Issues Found ({analysis.issues.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {analysis.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '20px',
                              borderLeft: `4px solid ${
                                issue.type === 'critical' ? '#ef4444' :
                                issue.type === 'warning' ? '#fbbf24' : '#3b82f6'
                              }`
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginBottom: '10px'
                            }}>
                              <span style={{ fontSize: '20px' }}>
                                {getIssueIcon(issue.type)}
                              </span>
                              <strong>{issue.issue}</strong>
                              <span style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                marginLeft: 'auto'
                              }}>
                                {issue.category}
                              </span>
                            </div>
                            <p style={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              marginBottom: '10px'
                            }}>
                              {issue.impact}
                            </p>
                            <p style={{ color: '#00ffc6' }}>
                              ✅ {issue.solution}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div>
                      <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                        💡 Opportunities ({analysis.opportunities.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {analysis.opportunities.map((opp, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '20px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <h4 style={{ marginBottom: '10px' }}>{opp.title}</h4>
                            <p style={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              marginBottom: '15px',
                              fontSize: '14px'
                            }}>
                              {opp.description}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{
                                padding: '4px 12px',
                                background: `${getImpactColor(opp.estimatedImpact)}20`,
                                color: getImpactColor(opp.estimatedImpact),
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                {opp.estimatedImpact.toUpperCase()} IMPACT
                              </span>
                              <span style={{
                                padding: '4px 12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '20px',
                                fontSize: '12px'
                              }}>
                                {opp.difficulty} • {opp.timeframe}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                      Technical SEO Analysis
                    </h3>
                    
                    {/* Technical Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '10px' }}>🔒 HTTPS</h4>
                        <div style={{ fontSize: '24px', color: analysis.technicalSEO.https ? '#10b981' : '#ef4444' }}>
                          {analysis.technicalSEO.https ? '✅ Enabled' : '❌ Not Enabled'}
                        </div>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '10px' }}>📱 Mobile Friendly</h4>
                        <div style={{ fontSize: '24px', color: analysis.technicalSEO.mobileFriendly ? '#10b981' : '#ef4444' }}>
                          {analysis.technicalSEO.mobileFriendly ? '✅ Yes' : '❌ No'}
                        </div>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '10px' }}>⚡ Page Speed (Mobile)</h4>
                        <div style={{ fontSize: '24px', color: getScoreColor(analysis.technicalSEO.pageSpeed.mobile) }}>
                          {analysis.technicalSEO.pageSpeed.mobile}/100
                        </div>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '10px' }}>💻 Page Speed (Desktop)</h4>
                        <div style={{ fontSize: '24px', color: getScoreColor(analysis.technicalSEO.pageSpeed.desktop) }}>
                          {analysis.technicalSEO.pageSpeed.desktop}/100
                        </div>
                      </div>
                    </div>

                    {/* Content Analysis */}
                    <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                      Content Analysis
                    </h3>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <div>
                          <h4 style={{ marginBottom: '10px' }}>Title Tag</h4>
                          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {analysis.contentAnalysis.titleTag.exists ? '✅ Present' : '❌ Missing'} 
                            {analysis.contentAnalysis.titleTag.exists && ` (${analysis.contentAnalysis.titleTag.length} chars)`}
                          </p>
                          <p style={{ color: analysis.contentAnalysis.titleTag.optimized ? '#10b981' : '#fbbf24' }}>
                            {analysis.contentAnalysis.titleTag.optimized ? '✅ Optimized' : '⚠️ Not optimized'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 style={{ marginBottom: '10px' }}>Meta Description</h4>
                          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {analysis.contentAnalysis.metaDescription.exists ? '✅ Present' : '❌ Missing'}
                            {analysis.contentAnalysis.metaDescription.exists && ` (${analysis.contentAnalysis.metaDescription.length} chars)`}
                          </p>
                          <p style={{ color: analysis.contentAnalysis.metaDescription.optimized ? '#10b981' : '#fbbf24' }}>
                            {analysis.contentAnalysis.metaDescription.optimized ? '✅ Optimized' : '⚠️ Not optimized'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 style={{ marginBottom: '10px' }}>Content Length</h4>
                          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {analysis.contentAnalysis.contentLength} words
                          </p>
                          <p style={{ color: analysis.contentAnalysis.contentLength > 500 ? '#10b981' : '#fbbf24' }}>
                            {analysis.contentAnalysis.contentLength > 500 ? '✅ Good length' : '⚠️ Consider adding more content'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 style={{ marginBottom: '10px' }}>Headings</h4>
                          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {analysis.contentAnalysis.headings.h1Count} H1 tags
                          </p>
                          <p style={{ color: analysis.contentAnalysis.headings.hasKeywords ? '#10b981' : '#fbbf24' }}>
                            {analysis.contentAnalysis.headings.hasKeywords ? '✅ Keywords present' : '⚠️ Add keywords to headings'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'local' && (
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                      Local SEO Performance
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '15px' }}>🗺️ Google My Business</h4>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                          {analysis.localSEO.googleMyBusiness ? (
                            <span style={{ color: '#10b981' }}>✅ Active</span>
                          ) : (
                            <span style={{ color: '#ef4444' }}>❌ Not Found</span>
                          )}
                        </div>
                        {!analysis.localSEO.googleMyBusiness && (
                          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                            Critical for local visibility. Claim your GMB listing immediately.
                          </p>
                        )}
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '15px' }}>📍 NAP Consistency</h4>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                          {analysis.localSEO.napConsistency ? (
                            <span style={{ color: '#10b981' }}>✅ Consistent</span>
                          ) : (
                            <span style={{ color: '#fbbf24' }}>⚠️ Inconsistent</span>
                          )}
                        </div>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                          Name, Address, Phone must match across all listings
                        </p>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '15px' }}>📂 Directory Listings</h4>
                        <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '10px' }}>
                          {analysis.localSEO.localDirectories}
                        </div>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                          {analysis.localSEO.localDirectories < 5 && 'Expand presence to 10-15 directories'}
                          {analysis.localSEO.localDirectories >= 5 && analysis.localSEO.localDirectories < 10 && 'Good start, aim for 10-15'}
                          {analysis.localSEO.localDirectories >= 10 && 'Excellent directory coverage'}
                        </p>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <h4 style={{ marginBottom: '15px' }}>⭐ Google Reviews</h4>
                        <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '10px' }}>
                          {analysis.localSEO.reviews.google}
                        </div>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                          Average rating: {analysis.localSEO.reviews.average}/5
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'competitors' && (
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                      Competitor Analysis ({analysis.competitors.length} found)
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {analysis.competitors.map((competitor, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                          }}>
                            <h4 style={{ fontSize: '18px' }}>{competitor.name}</h4>
                            <span style={{
                              padding: '6px 16px',
                              background: 'rgba(0, 255, 198, 0.2)',
                              color: '#00ffc6',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: 600
                            }}>
                              Rank #{competitor.ranking}
                            </span>
                          </div>
                          
                          <a 
                            href={competitor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#00d4ff',
                              fontSize: '14px',
                              marginBottom: '15px',
                              display: 'block'
                            }}
                          >
                            {competitor.url}
                          </a>
                          
                          <div>
                            <strong style={{ marginBottom: '10px', display: 'block' }}>
                              Competitive Strengths:
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {competitor.strengths.map((strength, sIdx) => (
                                <span
                                  key={sIdx}
                                  style={{
                                    padding: '4px 12px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    color: 'rgba(255, 255, 255, 0.8)'
                                  }}
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'keywords' && (
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                      Keyword Opportunities
                    </h3>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Keyword</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Monthly Searches</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Difficulty</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Current Rank</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Opportunity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.keywords.map((keyword, idx) => (
                            <tr 
                              key={idx}
                              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                            >
                              <td style={{ padding: '15px' }}>{keyword.keyword}</td>
                              <td style={{ padding: '15px' }}>{keyword.monthlySearches.toLocaleString()}</td>
                              <td style={{ padding: '15px' }}>
                                <span style={{
                                  color: keyword.difficulty > 70 ? '#ef4444' :
                                        keyword.difficulty > 40 ? '#fbbf24' : '#10b981'
                                }}>
                                  {keyword.difficulty}/100
                                </span>
                              </td>
                              <td style={{ padding: '15px' }}>
                                {keyword.currentRanking || '-'}
                              </td>
                              <td style={{ padding: '15px' }}>
                                {keyword.opportunity ? (
                                  <span style={{ color: '#00ffc6' }}>✅ High</span>
                                ) : (
                                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Low</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div style={{
                padding: '20px 30px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '15px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    // TODO: Implement PDF export
                    alert('PDF export coming soon!');
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  📄 Export PDF
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close Report
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};