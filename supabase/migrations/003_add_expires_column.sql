-- Add the expires_at column if it doesn't exist
ALTER TABLE canvas_research_cache 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');

-- Create index on expires_at if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_research_cache_expires ON canvas_research_cache(expires_at);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_research_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM canvas_research_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Update existing rows to have an expiration date
UPDATE canvas_research_cache 
SET expires_at = created_at + INTERVAL '7 days' 
WHERE expires_at IS NULL;