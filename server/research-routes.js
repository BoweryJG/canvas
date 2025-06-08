/**
 * Enhanced Research Routes for Render Backend
 * Handles complex, long-running research operations
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// In-memory stores (use Redis in production)
const researchJobs = new Map();
const rateLimiter = new Map();
const cache = new Map();

// Constants
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // More generous on backend
  delayMs: 1000 // Minimum delay between requests
};

// Rate limiting middleware
const checkRateLimit = (req, res, next) => {
  const userId = req.body.userId || req.ip;
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // Clean old requests
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT.windowMs);
  
  if (validRequests.length >= RATE_LIMIT.maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((validRequests[0] + RATE_LIMIT.windowMs - now) / 1000)
    });
  }
  
  validRequests.push(now);
  rateLimiter.set(userId, validRequests);
  next();
};

// Brave Search proxy
router.post('/brave-search', async (req, res) => {
  const { q } = req.body;
  
  if (!q) {
    return res.status(400).json({ error: 'Query required' });
  }
  
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
  if (!BRAVE_API_KEY) {
    console.error('BRAVE_API_KEY not configured');
    return res.status(500).json({ error: 'Brave Search not configured' });
  }
  
  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Brave API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Brave Search error:', error);
    res.status(500).json({ error: 'Brave Search API error', message: error.message });
  }
});

// OpenRouter proxy
router.post('/openrouter', async (req, res) => {
  const { prompt, model = 'anthropic/claude-opus-4' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY not configured');
    return res.status(500).json({ error: 'OpenRouter not configured' });
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://canvas.repspheres.com',
        'X-Title': 'Canvas Sales Intelligence'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenRouter error:', error);
    res.status(500).json({ error: 'OpenRouter API failed', message: error.message });
  }
});

// Firecrawl proxy
router.post('/firecrawl-scrape', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }
  
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  if (!FIRECRAWL_API_KEY) {
    console.error('FIRECRAWL_API_KEY not configured');
    return res.status(500).json({ error: 'Firecrawl not configured' });
  }
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Firecrawl error:', error);
    res.status(500).json({ error: 'Firecrawl API error', message: error.message });
  }
});

// NPI Lookup proxy
router.get('/npi-lookup', async (req, res) => {
  const { search } = req.query;
  
  if (!search) {
    return res.status(400).json({ error: 'Search query required' });
  }
  
  try {
    const response = await fetch(`https://npiregistry.cms.hhs.gov/api/?version=2.1&search_type=NPI&name=${encodeURIComponent(search)}`);
    
    if (!response.ok) {
      throw new Error(`NPI API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('NPI lookup error:', error);
    res.status(500).json({ error: 'NPI lookup failed', message: error.message });
  }
});

// Start research job
router.post('/research/start', checkRateLimit, async (req, res) => {
  const { doctor, product, userId } = req.body;
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check cache first
  const cacheKey = `${doctor.npi}_${product}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3 * 24 * 60 * 60 * 1000) { // 3 days
    return res.json({
      jobId,
      status: 'completed',
      fromCache: true,
      data: cached.data
    });
  }
  
  // Initialize job
  const job = {
    id: jobId,
    status: 'processing',
    progress: 0,
    stages: {
      website: { status: 'pending', result: null },
      reviews: { status: 'pending', result: null },
      competition: { status: 'pending', result: null },
      synthesis: { status: 'pending', result: null }
    },
    doctor,
    product,
    userId,
    startTime: Date.now(),
    updates: []
  };
  
  researchJobs.set(jobId, job);
  
  // Start async processing
  processResearchJob(job);
  
  res.json({
    jobId,
    status: 'started',
    estimatedTime: 45, // seconds
    pollUrl: `/api/research/${jobId}/status`
  });
});

// Get job status
router.get('/research/:jobId/status', (req, res) => {
  const job = researchJobs.get(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const response = {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    stages: job.stages,
    elapsedTime: Math.round((Date.now() - job.startTime) / 1000),
    updates: job.updates.slice(-5) // Last 5 updates
  };
  
  if (job.status === 'completed') {
    response.data = job.result;
    response.confidence = job.confidence;
  } else if (job.status === 'failed') {
    response.error = job.error;
  }
  
  res.json(response);
});

// Stream updates via SSE
router.get('/research/:jobId/stream', (req, res) => {
  const job = researchJobs.get(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  // Setup SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial state
  res.write(`data: ${JSON.stringify({
    type: 'initial',
    status: job.status,
    progress: job.progress
  })}\n\n`);
  
  // Setup listener for updates
  const updateInterval = setInterval(() => {
    if (job.status === 'completed' || job.status === 'failed') {
      res.write(`data: ${JSON.stringify({
        type: 'final',
        status: job.status,
        result: job.result
      })}\n\n`);
      clearInterval(updateInterval);
      res.end();
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        progress: job.progress,
        currentStage: job.currentStage,
        message: job.updates[job.updates.length - 1]
      })}\n\n`);
    }
  }, 1000);
  
  req.on('close', () => {
    clearInterval(updateInterval);
  });
});

// Process research job
async function processResearchJob(job) {
  try {
    // Stage 1: Website Discovery (25%)
    job.currentStage = 'website';
    job.updates.push('🔍 Searching for practice website...');
    job.stages.website.status = 'active';
    
    const websiteData = await findPracticeWebsite(job.doctor);
    job.stages.website.status = 'completed';
    job.stages.website.result = websiteData;
    job.progress = 25;
    
    if (websiteData.url) {
      job.updates.push(`✅ Found website: ${websiteData.url}`);
    }
    
    // Stage 2: Reviews (50%)
    job.currentStage = 'reviews';
    job.updates.push('⭐ Gathering reviews from multiple sources...');
    job.stages.reviews.status = 'active';
    
    const reviewData = await gatherReviews(job.doctor, websiteData);
    job.stages.reviews.status = 'completed';
    job.stages.reviews.result = reviewData;
    job.progress = 50;
    job.updates.push(`✅ Found ${reviewData.totalReviews} reviews`);
    
    // Stage 3: Competition (75%)
    job.currentStage = 'competition';
    job.updates.push('🏢 Analyzing local competition...');
    job.stages.competition.status = 'active';
    
    const competitorData = await analyzeCompetition(job.doctor);
    job.stages.competition.status = 'completed';
    job.stages.competition.result = competitorData;
    job.progress = 75;
    job.updates.push(`✅ Analyzed ${competitorData.length} competitors`);
    
    // Stage 4: AI Synthesis (100%)
    job.currentStage = 'synthesis';
    job.updates.push('🧠 Creating intelligence report...');
    job.stages.synthesis.status = 'active';
    
    const synthesis = await createSynthesis(
      job.doctor,
      job.product,
      websiteData,
      reviewData,
      competitorData
    );
    
    job.stages.synthesis.status = 'completed';
    job.stages.synthesis.result = synthesis;
    job.progress = 100;
    
    // Calculate confidence
    const confidence = calculateConfidence({
      websiteFound: !!websiteData.url,
      websiteCrawled: !!websiteData.content,
      reviewCount: reviewData.totalReviews,
      competitorCount: competitorData.length,
      buyingSignals: synthesis.buyingSignals?.length || 0
    });
    
    // Complete job
    job.status = 'completed';
    job.confidence = confidence;
    job.result = {
      doctor: job.doctor,
      website: websiteData,
      reviews: reviewData,
      competitors: competitorData,
      synthesis,
      confidence,
      sources: collectAllSources(websiteData, reviewData, competitorData)
    };
    job.updates.push(`✅ Research complete! Confidence: ${confidence.score}%`);
    
    // Cache result
    const cacheKey = `${job.doctor.npi}_${job.product}`;
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: job.result
    });
    
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    job.updates.push(`❌ Error: ${error.message}`);
  }
}

// Helper functions (implement with actual API calls)
async function findPracticeWebsite(doctor) {
  // Implement website discovery logic
  return {
    url: null,
    content: null,
    crawled: false
  };
}

async function gatherReviews(doctor, websiteData) {
  // Implement review gathering
  return {
    totalReviews: 0,
    averageRating: null,
    sources: []
  };
}

async function analyzeCompetition(doctor) {
  // Implement competition analysis
  return [];
}

async function createSynthesis(doctor, product, website, reviews, competitors) {
  // Call OpenRouter with enhanced prompt
  return {
    executiveSummary: '',
    buyingSignals: [],
    approachStrategy: {}
  };
}

function calculateConfidence(factors) {
  let score = 35; // NPI base
  
  // Add points for various factors
  if (factors.websiteFound) score += 7;
  if (factors.websiteCrawled) score += 8;
  if (factors.reviewCount > 0) score += Math.min(10, Math.floor(factors.reviewCount / 5));
  if (factors.competitorCount > 0) score += 3;
  if (factors.buyingSignals > 0) score += Math.min(7, factors.buyingSignals * 2);
  
  return {
    score: Math.min(95, score),
    factors: {
      npi: 35,
      website: factors.websiteFound ? (factors.websiteCrawled ? 15 : 7) : 0,
      reviews: Math.min(10, Math.floor(factors.reviewCount / 5)),
      analysis: Math.min(10, (factors.competitorCount > 0 ? 3 : 0) + factors.buyingSignals * 2)
    }
  };
}

function collectAllSources(...dataSets) {
  // Combine all sources
  return [];
}

// Cleanup old jobs periodically
setInterval(() => {
  const now = Date.now();
  const OLD_JOB_THRESHOLD = 60 * 60 * 1000; // 1 hour
  
  for (const [jobId, job] of researchJobs.entries()) {
    if (now - job.startTime > OLD_JOB_THRESHOLD) {
      researchJobs.delete(jobId);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = router;