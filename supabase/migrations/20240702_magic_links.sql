-- Create magic_links table
CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_data TEXT NOT NULL, -- Encrypted report data
    doctor_name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
    password_hash TEXT,
    custom_message TEXT,
    allow_download BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT FALSE,
    domain_restrictions TEXT[],
    ip_whitelist TEXT[],
    requires_2fa BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    analytics JSONB DEFAULT '{"views": [], "downloads": [], "timeSpent": [], "sectionEngagement": {}, "devices": []}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_magic_links_created_by ON public.magic_links(created_by);
CREATE INDEX idx_magic_links_expires_at ON public.magic_links(expires_at);
CREATE INDEX idx_magic_links_tier ON public.magic_links(tier);

-- Create magic_link_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS public.magic_link_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID REFERENCES public.magic_links(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'comment', 'share')),
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for analytics queries
CREATE INDEX idx_magic_link_analytics_link_id ON public.magic_link_analytics(link_id);
CREATE INDEX idx_magic_link_analytics_event_type ON public.magic_link_analytics(event_type);

-- Create share_events table for user activity tracking
CREATE TABLE IF NOT EXISTS public.share_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    link_id UUID REFERENCES public.magic_links(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    tier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for share events
CREATE INDEX idx_share_events_user_id ON public.share_events(user_id);
CREATE INDEX idx_share_events_created_at ON public.share_events(created_at);

-- Create functions for incrementing views and downloads
CREATE OR REPLACE FUNCTION increment_magic_link_views(link_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.magic_links 
    SET views = views + 1,
        last_viewed_at = TIMEZONE('utc'::text, NOW())
    WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_magic_link_downloads(link_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.magic_links 
    SET downloads = downloads + 1
    WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own magic links
CREATE POLICY "Users can create their own magic links" ON public.magic_links
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Users can view their own magic links
CREATE POLICY "Users can view their own magic links" ON public.magic_links
    FOR SELECT USING (auth.uid() = created_by);

-- Policy: Anyone can view magic links by ID (for sharing)
CREATE POLICY "Anyone can view magic links by ID" ON public.magic_links
    FOR SELECT USING (true);

-- Policy: Users can update their own magic links
CREATE POLICY "Users can update their own magic links" ON public.magic_links
    FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Users can delete their own magic links
CREATE POLICY "Users can delete their own magic links" ON public.magic_links
    FOR DELETE USING (auth.uid() = created_by);

-- Policy: Analytics can be inserted by anyone (for tracking)
CREATE POLICY "Anyone can insert analytics" ON public.magic_link_analytics
    FOR INSERT WITH CHECK (true);

-- Policy: Users can view analytics for their own links
CREATE POLICY "Users can view analytics for their links" ON public.magic_link_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.magic_links
            WHERE magic_links.id = magic_link_analytics.link_id
            AND magic_links.created_by = auth.uid()
        )
    );

-- Policy: Users can insert their own share events
CREATE POLICY "Users can insert their own share events" ON public.share_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own share events
CREATE POLICY "Users can view their own share events" ON public.share_events
    FOR SELECT USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.magic_links TO authenticated;
GRANT ALL ON public.magic_link_analytics TO authenticated;
GRANT ALL ON public.share_events TO authenticated;
GRANT ALL ON public.magic_links TO anon; -- For viewing shared links
GRANT INSERT ON public.magic_link_analytics TO anon; -- For tracking views

-- Grant function permissions
GRANT EXECUTE ON FUNCTION increment_magic_link_views TO anon;
GRANT EXECUTE ON FUNCTION increment_magic_link_downloads TO anon;