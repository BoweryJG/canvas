import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema setup SQL:
/*
-- Create users table (optional, for user management)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  doctor_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  doctor_profile TEXT,
  product_intel TEXT,
  sales_brief TEXT,
  insights JSONB,
  deep_research JSONB,
  scan_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_actions table (track what actions users take)
CREATE TABLE scan_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  action_type TEXT NOT NULL, -- 'pdf_export', 'email_sent', 'call_made', 'sms_sent', 'deep_research'
  action_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create research cache table for web research results
CREATE TABLE canvas_research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name TEXT NOT NULL,
  research_data JSONB NOT NULL,
  confidence_score INTEGER NOT NULL,
  source_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create research sources tracking table
CREATE TABLE canvas_research_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_cache_id UUID REFERENCES canvas_research_cache(id),
  url TEXT NOT NULL,
  title TEXT,
  source_type TEXT NOT NULL, -- 'practice_website', 'medical_directory', 'review_site', etc.
  content_summary TEXT,
  confidence_score INTEGER NOT NULL,
  scrape_success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at);
CREATE INDEX idx_scans_score ON scans(score);
CREATE INDEX idx_scan_actions_scan_id ON scan_actions(scan_id);
CREATE INDEX idx_scan_actions_type ON scan_actions(action_type);

-- Research cache indexes
CREATE INDEX idx_research_cache_doctor_name ON canvas_research_cache(doctor_name);
CREATE INDEX idx_research_cache_expiry ON canvas_research_cache(expiry_date);
CREATE INDEX idx_research_cache_confidence ON canvas_research_cache(confidence_score);
CREATE INDEX idx_research_sources_cache_id ON canvas_research_sources(research_cache_id);
CREATE INDEX idx_research_sources_type ON canvas_research_sources(source_type);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_research_sources ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - users can only see their own data)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own scans" ON scans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scan actions" ON scan_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_actions.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

-- Research cache policies (allow anonymous access for Canvas)
CREATE POLICY "Allow anonymous research cache access" ON canvas_research_cache
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous research sources access" ON canvas_research_sources
  FOR ALL USING (true);
*/

// Scan operations
export async function saveScan(scanResult, userId = null) {
  try {
    const { data, error } = await supabase
      .from('canvas_scans')
      .insert([
        {
          user_id: userId,
          doctor_name: scanResult.doctor,
          product_name: scanResult.product,
          score: scanResult.score,
          doctor_profile: scanResult.doctorProfile,
          product_intel: scanResult.productIntel,
          sales_brief: scanResult.salesBrief,
          insights: scanResult.insights,
          scan_duration: scanResult.scanDuration || 3
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error saving scan:', error)
    return { success: false, error: error.message }
  }
}

export async function getScanHistory(userId, limit = 50) {
  try {
    let query = supabase
      .from('canvas_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (userId === null) {
      query = query.is('user_id', null)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error getting scan history:', error)
    return { success: false, error: error.message }
  }
}

export async function saveDeepResearch(scanId, deepResearchData) {
  try {
    const { data, error } = await supabase
      .from('canvas_deep_research')
      .insert([
        {
          scan_id: scanId,
          ...deepResearchData
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error saving deep research:', error)
    return { success: false, error: error.message }
  }
}

export async function logScanAction(scanId, actionType, actionData = {}) {
  try {
    const { data, error } = await supabase
      .from('canvas_scan_actions')
      .insert([
        {
          scan_id: scanId,
          action_type: actionType,
          action_data: actionData
        }
      ])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error logging scan action:', error)
    return { success: false, error: error.message }
  }
}

// Analytics functions
export async function getScanAnalytics(userId) {
  try {
    const { data: scans, error: scansError } = await supabase
      .from('canvas_scans')
      .select('score, created_at, doctor_name, product_name')
      .eq('user_id', userId)

    if (scansError) throw scansError

    const { data: actions, error: actionsError } = await supabase
      .from('canvas_scan_actions')
      .select(`
        action_type,
        created_at,
        canvas_scans!inner(user_id)
      `)
      .eq('canvas_scans.user_id', userId)

    if (actionsError) throw actionsError

    return {
      success: true,
      data: {
        totalScans: scans.length,
        averageScore: scans.reduce((acc, scan) => acc + scan.score, 0) / scans.length || 0,
        highValueTargets: scans.filter(scan => scan.score >= 80).length,
        actionBreakdown: actions.reduce((acc, action) => {
          acc[action.action_type] = (acc[action.action_type] || 0) + 1
          return acc
        }, {}),
        recentActivity: scans.slice(0, 10)
      }
    }
  } catch (error) {
    console.error('Error getting analytics:', error)
    return { success: false, error: error.message }
  }
}