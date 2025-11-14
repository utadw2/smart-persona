-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('job_match', 'community_like', 'community_comment', 'persona_view', 'system', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "notifications_admin_all"
ON notifications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on job matches
CREATE OR REPLACE FUNCTION notify_job_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.match_score >= 70 THEN
    PERFORM create_notification(
      NEW.user_id,
      'job_match',
      'New Job Match!',
      'A new job matches your persona with ' || NEW.match_score || '% compatibility',
      '/dashboard/jobs',
      jsonb_build_object('job_id', NEW.job_id, 'match_score', NEW.match_score)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_job_match_created
  AFTER INSERT ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_match();

-- Trigger to notify on post likes
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner_id UUID;
BEGIN
  -- Get post owner
  SELECT user_id INTO v_post_owner_id
  FROM community_posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user liked their own post
  IF v_post_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_post_owner_id,
      'community_like',
      'Someone liked your post',
      'Your post received a new like',
      '/community',
      jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_liked
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_like();

-- Trigger to notify on post comments
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner_id UUID;
BEGIN
  -- Get post owner
  SELECT user_id INTO v_post_owner_id
  FROM community_posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user commented on their own post
  IF v_post_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_post_owner_id,
      'community_comment',
      'New comment on your post',
      'Someone commented on your post',
      '/community',
      jsonb_build_object('post_id', NEW.post_id, 'commenter_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_commented
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();
