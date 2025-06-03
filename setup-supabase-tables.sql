-- Canvas Research Cache Tables Setup
-- Run this in your Supabase SQL Editor

-- Create the canvas_research_cache table
CREATE TABLE IF NOT EXISTS canvas_research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name TEXT NOT NULL,
  research_data JSONB NOT NULL,
  confidence_score INTEGER NOT NULL,
  source_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the canvas_research_sources table
CREATE TABLE IF NOT EXISTS canvas_research_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_cache_id UUID REFERENCES canvas_research_cache(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  source_type TEXT NOT NULL, -- 'practice_website', 'medical_directory', 'review_site', etc.
  content_summary TEXT,
  confidence_score INTEGER NOT NULL,
  scrape_success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_cache_doctor_name ON canvas_research_cache(doctor_name);
CREATE INDEX IF NOT EXISTS idx_research_cache_expiry ON canvas_research_cache(expiry_date);
CREATE INDEX IF NOT EXISTS idx_research_cache_confidence ON canvas_research_cache(confidence_score);
CREATE INDEX IF NOT EXISTS idx_research_sources_cache_id ON canvas_research_sources(research_cache_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_type ON canvas_research_sources(source_type);

-- Enable Row Level Security
ALTER TABLE canvas_research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_research_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (since Canvas uses this)
CREATE POLICY "Allow anonymous research cache access" ON canvas_research_cache
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous research sources access" ON canvas_research_sources
  FOR ALL USING (true);

-- Create the canvas_scans table if it doesn't exist
CREATE TABLE IF NOT EXISTS canvas_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  doctor_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  doctor_profile TEXT,
  product_intel TEXT,
  sales_brief TEXT,
  insights JSONB,
  deep_research JSONB,
  scan_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the canvas_scan_actions table
CREATE TABLE IF NOT EXISTS canvas_scan_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES canvas_scans(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'pdf_export', 'email_sent', 'call_made', 'sms_sent', 'deep_research'
  action_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scans
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON canvas_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scans_score ON canvas_scans(score);
CREATE INDEX IF NOT EXISTS idx_scan_actions_scan_id ON canvas_scan_actions(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_actions_type ON canvas_scan_actions(action_type);

-- Enable RLS for scans
ALTER TABLE canvas_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_scan_actions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for now (you can make this more restrictive later)
CREATE POLICY "Allow anonymous scan access" ON canvas_scans
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous scan action access" ON canvas_scan_actions
  FOR ALL USING (true);