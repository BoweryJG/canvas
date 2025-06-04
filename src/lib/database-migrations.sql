-- RepSpheres Subscription & Usage Tracking Database Schema

-- Create user_profiles table to store subscription data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  subscription JSONB DEFAULT '{
    "tier": "explorer",
    "status": "active",
    "credits": 5,
    "creditsUsed": 0,
    "magicLinksUsed": 0,
    "magicLinksLimit": 0,
    "billingCycle": "monthly",
    "startDate": null,
    "endDate": null,
    "stripeCustomerId": null,
    "stripeSubscriptionId": null
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'canvas_scan', 'magic_link', 'deep_research', etc.
  credits_used INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_tracking(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_action ON usage_tracking(action);
CREATE INDEX IF NOT EXISTS idx_usage_user_action_date ON usage_tracking(user_id, action, created_at DESC);

-- Temporary emails for long magic links
CREATE TABLE IF NOT EXISTS temp_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  email_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accessed BOOLEAN DEFAULT FALSE
);

-- Auto-delete expired temp emails
CREATE INDEX IF NOT EXISTS idx_temp_emails_expires ON temp_emails(expires_at);

-- Function to get current month usage
CREATE OR REPLACE FUNCTION get_monthly_usage(p_user_id UUID)
RETURNS TABLE (
  total_credits_used INTEGER,
  magic_links_used INTEGER,
  canvas_scans INTEGER,
  deep_research_reports INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(credits_used), 0)::INTEGER as total_credits_used,
    COUNT(*) FILTER (WHERE action = 'magic_link')::INTEGER as magic_links_used,
    COUNT(*) FILTER (WHERE action = 'canvas_scan')::INTEGER as canvas_scans,
    COUNT(*) FILTER (WHERE action = 'deep_research')::INTEGER as deep_research_reports
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_perform_action(
  p_user_id UUID,
  p_action TEXT,
  p_credits_needed INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_subscription JSONB;
  v_credits_used INTEGER;
  v_credits_limit INTEGER;
BEGIN
  -- Get user subscription
  SELECT subscription INTO v_subscription
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Check if subscription is active
  IF v_subscription->>'status' != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Enterprise tier has unlimited access
  IF v_subscription->>'tier' = 'enterprise' THEN
    RETURN TRUE;
  END IF;
  
  -- Get credits limit and usage
  v_credits_limit := (v_subscription->>'credits')::INTEGER;
  
  SELECT COALESCE(SUM(credits_used), 0) INTO v_credits_used
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Check if user has enough credits
  RETURN (v_credits_used + p_credits_needed) <= v_credits_limit;
END;
$$ LANGUAGE plpgsql;

-- Email tracking for analytics
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'sent', 'opened', 'clicked', 'replied'
  recipient_email TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_user ON email_tracking(user_id, created_at DESC);

-- Subscription history for auditing
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  old_tier TEXT,
  new_tier TEXT,
  change_type TEXT, -- 'upgrade', 'downgrade', 'cancel', 'reactivate'
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON usage_tracking
  FOR INSERT WITH CHECK (true);

-- Policies for email_tracking
CREATE POLICY "Users can view own email tracking" ON email_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for temp_emails
CREATE POLICY "Anyone can view temp emails" ON temp_emails
  FOR SELECT USING (true);

-- Policies for subscription_history
CREATE POLICY "Users can view own subscription history" ON subscription_history
  FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;