-- Function to sync Google profile picture to avatar_url
CREATE OR REPLACE FUNCTION public.handle_user_metadata_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if raw_user_meta_data has picture but not avatar_url
  IF NEW.raw_user_meta_data->>'picture' IS NOT NULL 
     AND (NEW.raw_user_meta_data->>'avatar_url' IS NULL 
          OR NEW.raw_user_meta_data->>'avatar_url' = '') THEN
    
    -- Update the raw_user_meta_data to include avatar_url
    NEW.raw_user_meta_data = NEW.raw_user_meta_data || 
      jsonb_build_object('avatar_url', NEW.raw_user_meta_data->>'picture');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS sync_user_metadata_on_insert ON auth.users;
CREATE TRIGGER sync_user_metadata_on_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_metadata_sync();

-- Create trigger for updates
DROP TRIGGER IF EXISTS sync_user_metadata_on_update ON auth.users;
CREATE TRIGGER sync_user_metadata_on_update
  BEFORE UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_metadata_sync();

-- Fix existing users who have picture but not avatar_url
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object('avatar_url', raw_user_meta_data->>'picture')
WHERE raw_user_meta_data->>'picture' IS NOT NULL 
  AND (raw_user_meta_data->>'avatar_url' IS NULL 
       OR raw_user_meta_data->>'avatar_url' = '');