-- Create a generic cache table for the intelligent caching system
CREATE TABLE IF NOT EXISTS cache_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache_entries(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);

-- Enable Row Level Security
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (since Canvas uses this)
CREATE POLICY "Allow anonymous cache read" ON cache_entries
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous cache write" ON cache_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous cache update" ON cache_entries
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous cache delete" ON cache_entries
  FOR DELETE USING (true);

-- Function to clean up expired entries (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache_entries WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;