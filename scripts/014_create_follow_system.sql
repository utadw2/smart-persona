-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "follows_select_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Add follower/following counts to profiles (computed on demand)
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM follows WHERE following_id = user_id;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM follows WHERE follower_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Trigger to create notification on follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT full_name INTO follower_name FROM profiles WHERE id = NEW.follower_id;
  
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    NEW.following_id,
    'follow',
    'New Follower',
    follower_name || ' started following you',
    '/profile/' || NEW.follower_id,
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follows_notification_trigger
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION notify_on_follow();
