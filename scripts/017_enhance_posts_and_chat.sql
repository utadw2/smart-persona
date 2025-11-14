-- Add comment replies and shares
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Add parent_id for comment replies
ALTER TABLE post_comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Chat messages table for real-time chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat conversations (for organizing chats)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL, -- 'sidebar', 'banner', 'feed'
  is_active BOOLEAN DEFAULT TRUE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Post shares policies
CREATE POLICY "post_shares_select_all" ON post_shares FOR SELECT USING (true);
CREATE POLICY "post_shares_insert_own" ON post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_shares_delete_own" ON post_shares FOR DELETE USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "comment_likes_select_all" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert_own" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete_own" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "chat_messages_select_own" ON chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "chat_messages_insert_own" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "chat_messages_update_own" ON chat_messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Chat conversations policies
CREATE POLICY "chat_conversations_select_own" ON chat_conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "chat_conversations_insert_own" ON chat_conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Ads policies
CREATE POLICY "ads_select_active" ON ads FOR SELECT USING (is_active = true);
CREATE POLICY "ads_admin_all" ON ads FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Functions to update counts
CREATE OR REPLACE FUNCTION increment_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{shares_count}', to_jsonb(COALESCE((metadata->>'shares_count')::int, 0) + 1))
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{shares_count}', to_jsonb(GREATEST(COALESCE((metadata->>'shares_count')::int, 0) - 1, 0)))
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_post_share_increment ON post_shares;
CREATE TRIGGER trigger_post_share_increment
  AFTER INSERT ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_shares_count();

DROP TRIGGER IF EXISTS trigger_post_share_decrement ON post_shares;
CREATE TRIGGER trigger_post_share_decrement
  AFTER DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_shares_count();

-- Auto-publish all personas to community
UPDATE personas SET visibility = 'published', is_public = true WHERE visibility = 'private';
