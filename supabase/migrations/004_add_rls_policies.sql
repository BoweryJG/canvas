-- Enable RLS on the existing table
ALTER TABLE canvas_research_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access" ON canvas_research_cache
  FOR SELECT TO public USING (true);

-- Create policy for public insert
CREATE POLICY IF NOT EXISTS "Allow public insert" ON canvas_research_cache
  FOR INSERT TO public WITH CHECK (true);

-- Create policy for public update (to refresh cache)
CREATE POLICY IF NOT EXISTS "Allow public update" ON canvas_research_cache
  FOR UPDATE TO public USING (true);

-- Optional: Create a function to clean up expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_research_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM canvas_research_cache WHERE expiry_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-research-cache', '0 2 * * *', 'SELECT cleanup_expired_research_cache();');