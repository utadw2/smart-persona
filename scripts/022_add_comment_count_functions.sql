-- Create functions to automatically update comment counts
CREATE OR REPLACE FUNCTION increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts 
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts 
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_comment_increment ON post_comments;
CREATE TRIGGER trigger_comment_increment
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comments();

DROP TRIGGER IF EXISTS trigger_comment_decrement ON post_comments;
CREATE TRIGGER trigger_comment_decrement
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comments();
