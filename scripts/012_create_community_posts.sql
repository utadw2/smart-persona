-- Create community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'project', 'achievement', 'question')),
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_persona_id ON community_posts(persona_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- RLS Policies for community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_posts_select_published"
ON community_posts FOR SELECT
TO authenticated
USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "community_posts_insert_own"
ON community_posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "community_posts_update_own"
ON community_posts FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "community_posts_delete_own"
ON community_posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "community_posts_admin_all"
ON community_posts FOR ALL
TO authenticated
USING (is_admin());

-- RLS Policies for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select_all"
ON post_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "post_likes_insert_own"
ON post_likes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_likes_delete_own"
ON post_likes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_comments_select_all"
ON post_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "post_comments_insert_own"
ON post_comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_comments_update_own"
ON post_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "post_comments_delete_own"
ON post_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger to update comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
