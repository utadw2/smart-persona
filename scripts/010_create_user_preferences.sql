-- Create user preferences table for storing session and UI preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session Preferences
  remember_me BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 30,
  auto_logout BOOLEAN DEFAULT true,
  
  -- UI Preferences
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'instant' CHECK (notification_frequency IN ('instant', 'daily', 'weekly', 'never')),
  
  -- Privacy Preferences
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'connections_only')),
  show_online_status BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_can_view_own_preferences"
ON user_preferences FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_preferences"
ON user_preferences FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_preferences"
ON user_preferences FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create trigger to auto-create preferences on profile creation
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_preferences();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_timestamp();
