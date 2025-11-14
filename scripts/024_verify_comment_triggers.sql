-- Verify and create missing comment count triggers

-- Check if trigger exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_post_comments_count'
    ) THEN
        -- Create trigger function if it doesn't exist
        CREATE OR REPLACE FUNCTION update_post_comment_count()
        RETURNS TRIGGER AS $func$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                UPDATE community_posts 
                SET comments_count = comments_count + 1 
                WHERE id = NEW.post_id;
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                UPDATE community_posts 
                SET comments_count = GREATEST(0, comments_count - 1) 
                WHERE id = OLD.post_id;
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create the trigger
        CREATE TRIGGER update_post_comments_count
        AFTER INSERT OR DELETE ON post_comments
        FOR EACH ROW
        EXECUTE FUNCTION update_post_comment_count();
    END IF;
END $$;

-- Recalculate existing comment counts to ensure accuracy
UPDATE community_posts p
SET comments_count = (
    SELECT COUNT(*) 
    FROM post_comments c 
    WHERE c.post_id = p.id
);
