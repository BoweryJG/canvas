import React, { useState } from 'react';
import { type ResearchData } from '../lib/webResearch';

interface ResearchPanelProps {
  researchData: ResearchData | null;
  isResearching: boolean;
  researchQuality: 'verified' | 'partial' | 'inferred' | 'unknown';
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({ 
  researchData, 
  isResearching, 
  researchQuality 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'verified': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'inferred': return '#ef4444';
      case 'unknown': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'verified': return '✅';
      case 'partial': return '⚠️';
      case 'inferred': return '❓';
      case 'unknown': return '❌';
      default: return '❌';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'verified': return 'Verified Data';
      case 'partial': return 'Partial Data';
      case 'inferred': return 'Inferred Data';
      case 'unknown': return 'No Research';
      default: return 'Unknown';
    }
  };

  if (isResearching) {
    return (
      <div className="research-panel researching">
        <div className="research-status">
          <div className="research-spinner"></div>
          <span className="research-text">🔍 Gathering Intelligence...</span>
        </div>
        <div className="research-progress">
          <div className="progress-steps">
            <div className="step active">Practice Search</div>
            <div className="step">Directory Scan</div>
            <div className="step">Review Analysis</div>
            <div className="step">Data Consolidation</div>
          </div>
        </div>
      </div>
    );
  }

  if (!researchData) {
    return (
      <div className="research-panel no-research">
        <div className="research-status">
          <span className="quality-indicator unknown">❌ No Research</span>
          <span className="research-text">No intelligence data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="research-panel">
      {/* Research Quality Header */}
      <div className="research-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="research-status">
          <span 
            className="quality-indicator"
            style={{ color: getQualityColor(researchQuality) }}
          >
            {getQualityIcon(researchQuality)} {getQualityLabel(researchQuality)}
          </span>
          <span className="confidence-score">{researchData.confidenceScore}% Confidence</span>
        </div>
        <div className="research-summary">
          <span className="source-count">{researchData.sources.length} Sources</span>
          <span className="toggle-icon">{showDetails ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Research Coverage Indicators */}
      <div className="research-coverage">
        <div className="coverage-grid">
          <div className={`coverage-item ${
            researchData.practiceInfo?.name || 
            researchData.practiceInfo?.address || 
            researchData.practiceInfo?.website ||
            researchData.practiceInfo?.phone ? 'verified' : 'missing'
          }`}>
            <span className="coverage-icon">{
              researchData.practiceInfo?.name || 
              researchData.practiceInfo?.address || 
              researchData.practiceInfo?.website ||
              researchData.practiceInfo?.phone ? '✅' : '❌'
            }</span>
            <span className="coverage-label">Practice Info</span>
          </div>
          <div className="coverage-item verified">
            <span className="coverage-icon">✅</span>
            <span className="coverage-label">Credentials</span>
          </div>
          <div className={`coverage-item ${
            researchData.reviews?.averageRating || 
            researchData.reviews?.totalReviews ||
            researchData.sources.some(s => s.type === 'review_site') ? 'verified' : 'missing'
          }`}>
            <span className="coverage-icon">{
              researchData.reviews?.averageRating || 
              researchData.reviews?.totalReviews ||
              researchData.sources.some(s => s.type === 'review_site') ? '✅' : '❌'
            }</span>
            <span className="coverage-label">Reviews</span>
          </div>
          <div className={`coverage-item ${
            researchData.businessIntel?.practiceType || 
            researchData.businessIntel?.technologyStack ||
            researchData.businessIntel?.specialty ||
            researchData.sources.some(s => s.type === 'practice_website' || s.type === 'news_article') ? 'verified' : 'missing'
          }`}>
            <span className="coverage-icon">{
              researchData.businessIntel?.practiceType || 
              researchData.businessIntel?.technologyStack ||
              researchData.businessIntel?.specialty ||
              researchData.sources.some(s => s.type === 'practice_website' || s.type === 'news_article') ? '✅' : '❌'
            }</span>
            <span className="coverage-label">Business Intel</span>
          </div>
        </div>
      </div>

      {/* Detailed Research Information */}
      {showDetails && (
        <div className="research-details">
          {/* Practice Information */}
          {researchData.practiceInfo && Object.keys(researchData.practiceInfo).length > 0 && (
            <div className="detail-section">
              <h4>📍 Practice Information</h4>
              <div className="detail-content">
                {researchData.practiceInfo.name && <p><strong>Name:</strong> {researchData.practiceInfo.name}</p>}
                {researchData.practiceInfo.address && <p><strong>Address:</strong> {researchData.practiceInfo.address}</p>}
                {researchData.practiceInfo.phone && <p><strong>Phone:</strong> {researchData.practiceInfo.phone}</p>}
                {researchData.practiceInfo.website && (
                  <p><strong>Website:</strong> <a href={researchData.practiceInfo.website} target="_blank" rel="noopener noreferrer">{researchData.practiceInfo.website}</a></p>
                )}
                {researchData.practiceInfo.specialties?.length && (
                  <p><strong>Specialties:</strong> {researchData.practiceInfo.specialties.join(', ')}</p>
                )}
                {researchData.practiceInfo.technology?.length && (
                  <p><strong>Technology:</strong> {researchData.practiceInfo.technology.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Credentials */}
          {researchData.credentials && Object.keys(researchData.credentials).length > 0 && (
            <div className="detail-section">
              <h4>🎓 Professional Credentials</h4>
              <div className="detail-content">
                {researchData.credentials.medicalSchool && (
                  <p><strong>Medical School:</strong> {researchData.credentials.medicalSchool}</p>
                )}
                {researchData.credentials.boardCertifications?.length && (
                  <p><strong>Board Certified:</strong> {researchData.credentials.boardCertifications.join(', ')}</p>
                )}
                {researchData.credentials.hospitalAffiliations?.length && (
                  <p><strong>Hospital Affiliations:</strong> {researchData.credentials.hospitalAffiliations.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Patient Reviews */}
          {researchData.reviews && Object.keys(researchData.reviews).length > 0 && (
            <div className="detail-section">
              <h4>⭐ Patient Feedback</h4>
              <div className="detail-content">
                {researchData.reviews.averageRating && (
                  <p><strong>Rating:</strong> {researchData.reviews.averageRating}/5 stars</p>
                )}
                {researchData.reviews.totalReviews && (
                  <p><strong>Total Reviews:</strong> {researchData.reviews.totalReviews}</p>
                )}
                {researchData.reviews.commonPraise?.length && (
                  <p><strong>Common Praise:</strong> {researchData.reviews.commonPraise.join(', ')}</p>
                )}
                {researchData.reviews.commonConcerns?.length && (
                  <p><strong>Common Concerns:</strong> {researchData.reviews.commonConcerns.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Sources */}
          <div className="detail-section">
            <h4>📚 Research Sources</h4>
            <div className="sources-list">
              {researchData.sources.map((source, index) => (
                <div key={index} className="source-item">
                  <div className="source-header">
                    <span className="source-type">{source.type.replace('_', ' ').toUpperCase()}</span>
                    <span className="source-confidence">{source.confidence}%</span>
                  </div>
                  <div className="source-title">{source.title}</div>
                  <div className="source-url">{source.url}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Timestamp */}
          <div className="research-timestamp">
            <span>Research completed: {new Date(researchData.completedAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPanel;