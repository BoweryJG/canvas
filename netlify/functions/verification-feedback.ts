import { Handler } from '@netlify/functions';

interface VerificationFeedback {
  verificationId: string;
  feedbackType: 'correct' | 'incorrect' | 'partial';
  corrections?: {
    actualPracticeName?: string;
    actualWebsite?: string;
    actualLocation?: string;
    additionalNotes?: string;
  };
  userConfirmedData?: {
    practiceName: string;
    website: string;
    isOfficialWebsite: boolean;
  };
}

interface LearningPattern {
  pattern: string;
  type: 'practice_name' | 'domain_pattern' | 'search_term';
  confidence: number;
  successCount: number;
  failureCount: number;
  examples: string[];
}

// In a real implementation, this would be stored in a database
const learningPatterns: Map<string, LearningPattern> = new Map();

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Handle GET request to retrieve learning patterns
  if (event.httpMethod === 'GET') {
    const patterns = Array.from(learningPatterns.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 50); // Top 50 patterns

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        patterns,
        totalPatterns: learningPatterns.size,
        summary: generateLearningSummary(patterns)
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const feedback: VerificationFeedback = JSON.parse(event.body || '{}');
    const { verificationId, feedbackType, corrections, userConfirmedData } = feedback;

    if (!verificationId || !feedbackType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Verification ID and feedback type are required' })
      };
    }

    console.log(`📊 Processing feedback for verification: ${verificationId}, Type: ${feedbackType}`);

    // Process the feedback
    const learningResults = await processVerificationFeedback(feedback);

    // Store confirmed practice information for future use
    if (userConfirmedData && userConfirmedData.isOfficialWebsite) {
      await storePracticeWebsite(userConfirmedData);
    }

    // Generate insights from the feedback
    const insights = generateInsights(feedback, learningResults);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Feedback processed successfully',
        learningResults,
        insights,
        improvementSuggestions: generateImprovementSuggestions(feedback)
      })
    };

  } catch (error) {
    console.error('Feedback processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Feedback processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function processVerificationFeedback(feedback: VerificationFeedback): Promise<any> {
  const results = {
    patternsUpdated: 0,
    newPatternsCreated: 0,
    confidenceAdjustments: []
  };

  // Process corrections to learn new patterns
  if (feedback.corrections) {
    // Learn from practice name corrections
    if (feedback.corrections.actualPracticeName) {
      const practicePattern = extractPracticePattern(feedback.corrections.actualPracticeName);
      updateLearningPattern(practicePattern, 'practice_name', feedback.feedbackType === 'correct');
      results.patternsUpdated++;
    }

    // Learn from website corrections
    if (feedback.corrections.actualWebsite) {
      const domainPattern = extractDomainPattern(feedback.corrections.actualWebsite);
      updateLearningPattern(domainPattern, 'domain_pattern', feedback.feedbackType === 'correct');
      results.patternsUpdated++;
    }
  }

  // Process confirmed data
  if (feedback.userConfirmedData) {
    const { practiceName, website } = feedback.userConfirmedData;
    
    // Create association pattern
    const associationKey = `${practiceName.toLowerCase()}_website`;
    const existingPattern = learningPatterns.get(associationKey);
    
    if (!existingPattern) {
      learningPatterns.set(associationKey, {
        pattern: website,
        type: 'practice_name',
        confidence: 100,
        successCount: 1,
        failureCount: 0,
        examples: [website]
      });
      results.newPatternsCreated++;
    } else {
      existingPattern.successCount++;
      existingPattern.confidence = calculateConfidence(
        existingPattern.successCount,
        existingPattern.failureCount
      );
    }
  }

  return results;
}

function extractPracticePattern(practiceName: string): string {
  // Extract common patterns from practice names
  const normalized = practiceName.toLowerCase();
  
  // Check for common practice name patterns
  if (normalized.includes('dental')) {
    const beforeDental = normalized.split('dental')[0].trim();
    return `${beforeDental}_dental`;
  }
  
  if (normalized.includes('family')) {
    return 'family_practice';
  }
  
  if (normalized.includes('pediatric')) {
    return 'pediatric_practice';
  }
  
  // Return normalized name as pattern
  return normalized.replace(/\s+/g, '_');
}

function extractDomainPattern(website: string): string {
  try {
    const url = new URL(website);
    const domain = url.hostname.replace('www.', '');
    const parts = domain.split('.');
    
    // Extract the main domain pattern
    if (parts.length >= 2) {
      const mainDomain = parts[0];
      
      // Check for common patterns
      if (mainDomain.includes('dental')) {
        return 'dental_domain';
      }
      
      if (mainDomain.includes('family')) {
        return 'family_domain';
      }
      
      if (mainDomain.includes('smile')) {
        return 'smile_domain';
      }
      
      // Check if it's a hyphenated domain
      if (mainDomain.includes('-')) {
        return 'hyphenated_domain';
      }
      
      // Check if it's a location-based domain
      if (/\d{5}/.test(mainDomain) || ['north', 'south', 'east', 'west'].some(dir => mainDomain.includes(dir))) {
        return 'location_domain';
      }
    }
    
    return 'custom_domain';
  } catch {
    return 'unknown_pattern';
  }
}

function updateLearningPattern(
  pattern: string, 
  type: 'practice_name' | 'domain_pattern' | 'search_term',
  success: boolean
): void {
  const existing = learningPatterns.get(pattern);
  
  if (existing) {
    if (success) {
      existing.successCount++;
    } else {
      existing.failureCount++;
    }
    existing.confidence = calculateConfidence(existing.successCount, existing.failureCount);
  } else {
    learningPatterns.set(pattern, {
      pattern,
      type,
      confidence: success ? 60 : 40,
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      examples: []
    });
  }
}

function calculateConfidence(successCount: number, failureCount: number): number {
  const total = successCount + failureCount;
  if (total === 0) return 50;
  
  const successRate = successCount / total;
  const confidenceBoost = Math.min(total * 2, 40); // More data = more confidence
  
  return Math.round(successRate * 60 + confidenceBoost);
}

async function storePracticeWebsite(data: {
  practiceName: string;
  website: string;
  isOfficialWebsite: boolean;
}): Promise<void> {
  // In a real implementation, this would store to a database
  // For now, we'll add it to our learning patterns
  const key = `verified_${data.practiceName.toLowerCase().replace(/\s+/g, '_')}`;
  
  learningPatterns.set(key, {
    pattern: data.website,
    type: 'practice_name',
    confidence: 100,
    successCount: 1,
    failureCount: 0,
    examples: [data.website]
  });
  
  console.log(`✅ Stored verified practice website: ${data.practiceName} -> ${data.website}`);
}

function generateInsights(feedback: VerificationFeedback, learningResults: any): any {
  const insights = {
    feedbackType: feedback.feedbackType,
    keyLearnings: [],
    patternStrength: 'weak',
    recommendedActions: []
  };

  // Analyze feedback type
  if (feedback.feedbackType === 'correct') {
    insights.keyLearnings.push('Verification approach was successful');
    insights.patternStrength = 'strong';
  } else if (feedback.feedbackType === 'incorrect') {
    insights.keyLearnings.push('Verification needs improvement');
    
    if (feedback.corrections?.actualPracticeName) {
      insights.keyLearnings.push(`Practice name mismatch: expected different format`);
      insights.recommendedActions.push('Improve practice name extraction logic');
    }
    
    if (feedback.corrections?.actualWebsite) {
      insights.keyLearnings.push(`Website discovery needs refinement`);
      insights.recommendedActions.push('Enhance domain pattern recognition');
    }
  }

  // Analyze patterns
  const highConfidencePatterns = Array.from(learningPatterns.values())
    .filter(p => p.confidence > 80);
    
  if (highConfidencePatterns.length > 10) {
    insights.patternStrength = 'strong';
    insights.keyLearnings.push(`${highConfidencePatterns.length} high-confidence patterns available`);
  }

  return insights;
}

function generateImprovementSuggestions(feedback: VerificationFeedback): string[] {
  const suggestions: string[] = [];

  if (feedback.feedbackType === 'incorrect') {
    suggestions.push('Consider searching with exact practice name in quotes');
    suggestions.push('Try domain-based search patterns (e.g., practicename.com)');
    
    if (feedback.corrections?.actualWebsite) {
      const domain = extractDomainPattern(feedback.corrections.actualWebsite);
      suggestions.push(`Look for ${domain} pattern in future searches`);
    }
  }

  if (feedback.feedbackType === 'partial') {
    suggestions.push('Request additional information from user upfront');
    suggestions.push('Use multiple search strategies simultaneously');
  }

  // Add pattern-based suggestions
  const relevantPatterns = Array.from(learningPatterns.values())
    .filter(p => p.confidence > 70)
    .slice(0, 3);
    
  for (const pattern of relevantPatterns) {
    suggestions.push(`Apply "${pattern.pattern}" pattern (${pattern.confidence}% confidence)`);
  }

  return suggestions;
}

function generateLearningSummary(patterns: LearningPattern[]): any {
  const summary = {
    totalPatterns: patterns.length,
    averageConfidence: 0,
    topPatternTypes: {},
    mostSuccessful: [],
    needsImprovement: []
  };

  if (patterns.length === 0) return summary;

  // Calculate average confidence
  summary.averageConfidence = Math.round(
    patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
  );

  // Count pattern types
  const typeCounts = patterns.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  summary.topPatternTypes = typeCounts;

  // Find most successful patterns
  summary.mostSuccessful = patterns
    .filter(p => p.confidence > 85)
    .slice(0, 5)
    .map(p => ({
      pattern: p.pattern,
      confidence: p.confidence,
      usage: p.successCount + p.failureCount
    }));

  // Find patterns needing improvement
  summary.needsImprovement = patterns
    .filter(p => p.confidence < 50 && (p.successCount + p.failureCount) > 3)
    .slice(0, 5)
    .map(p => ({
      pattern: p.pattern,
      confidence: p.confidence,
      failureRate: Math.round((p.failureCount / (p.successCount + p.failureCount)) * 100)
    }));

  return summary;
}