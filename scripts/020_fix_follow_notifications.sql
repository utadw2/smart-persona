-- Add 'follow' to allowed notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('job_match', 'community_like', 'community_comment', 'persona_view', 'system', 'message', 'follow', 'endorsement'));

-- Create trigger to notify on follows
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
BEGIN
  -- Get follower's name
  SELECT full_name INTO v_follower_name
  FROM profiles
  WHERE id = NEW.follower_id;
  
  -- Notify the person being followed
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    'New Follower',
    v_follower_name || ' started following you',
    '/dashboard/profile',
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_follow ON follows;

CREATE TRIGGER on_new_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();
