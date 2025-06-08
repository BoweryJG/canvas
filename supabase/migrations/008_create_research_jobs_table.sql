-- Create research_jobs table for Canvas instant and deep research
CREATE TABLE IF NOT EXISTS public.research_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_npi VARCHAR(20) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  product VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  -- Research status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Instant scan results (3-second)
  instant_results JSONB,
  instant_completed_at TIMESTAMPTZ,
  
  -- Deep research results
  deep_results JSONB,
  deep_completed_at TIMESTAMPTZ,
  
  -- Metadata
  error TEXT,
  sources_count INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_research_jobs_doctor_npi ON public.research_jobs(doctor_npi);
CREATE INDEX idx_research_jobs_user_id ON public.research_jobs(user_id);
CREATE INDEX idx_research_jobs_status ON public.research_jobs(status);
CREATE INDEX idx_research_jobs_created_at ON public.research_jobs(created_at DESC);
CREATE INDEX idx_research_jobs_doctor_product ON public.research_jobs(doctor_npi, product);

-- RLS policies
ALTER TABLE public.research_jobs ENABLE ROW LEVEL SECURITY;

-- Users can read their own research jobs
CREATE POLICY "Users can read own research jobs" ON public.research_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create research jobs
CREATE POLICY "Users can create research jobs" ON public.research_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own research jobs
CREATE POLICY "Users can update own research jobs" ON public.research_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to clean up old research jobs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_research_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.research_jobs 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create magic_links table for sharing research
CREATE TABLE IF NOT EXISTS public.magic_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  research_job_id UUID REFERENCES public.research_jobs(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  
  -- Link settings
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Content settings
  content_type VARCHAR(50) NOT NULL, -- 'email', 'linkedin', 'sms', 'presentation'
  content_data JSONB NOT NULL,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Index for token lookup
CREATE INDEX idx_magic_links_token ON public.magic_links(token);
CREATE INDEX idx_magic_links_expires_at ON public.magic_links(expires_at);

-- RLS for magic links
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read magic links by token (for sharing)
CREATE POLICY "Public can read magic links by token" ON public.magic_links
  FOR SELECT USING (true);

-- Only creator can manage their magic links
CREATE POLICY "Users can create magic links" ON public.magic_links
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own magic links" ON public.magic_links
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own magic links" ON public.magic_links
  FOR DELETE USING (auth.uid() = created_by);