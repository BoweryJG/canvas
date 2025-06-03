-- Create research cache table for storing research results
CREATE TABLE IF NOT EXISTS canvas_research_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  location TEXT,
  research_data JSONB,
  confidence INTEGER DEFAULT 0,
  sources_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_research_cache_doctor ON canvas_research_cache(doctor_name);
CREATE INDEX IF NOT EXISTS idx_research_cache_created ON canvas_research_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_research_cache_expires ON canvas_research_cache(expires_at);

-- Enable RLS
ALTER TABLE canvas_research_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since it's a cache)
CREATE POLICY "Allow public read access" ON canvas_research_cache
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert" ON canvas_research_cache
  FOR INSERT TO public WITH CHECK (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_research_cache_updated_at
  BEFORE UPDATE ON canvas_research_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_research_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM canvas_research_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;