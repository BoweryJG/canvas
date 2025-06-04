-- Add credits tracking to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP WITH TIME ZONE;

-- Update existing users to have 10 credits
UPDATE user_profiles 
SET credits_remaining = 10 
WHERE credits_remaining IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON user_profiles(credits_remaining);

-- Add RLS policy for users to read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Add RLS policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);