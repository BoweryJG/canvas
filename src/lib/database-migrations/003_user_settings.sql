-- Create user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_bcc_email TEXT,
  crm_type TEXT, -- 'hubspot', 'salesforce', 'pipedrive', etc.
  email_signature TEXT,
  default_email_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own settings
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE
  ON user_settings FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);