-- Add public visibility to personas
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private',
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Add indexes for community features
CREATE INDEX IF NOT EXISTS idx_personas_public ON personas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_personas_visibility ON personas(visibility);

-- Update RLS policies for public personas
CREATE POLICY "Public personas are viewable by everyone"
ON personas FOR SELECT
TO authenticated
USING (is_public = true OR visibility = 'public');

-- Add comments
COMMENT ON COLUMN personas.is_public IS 'Whether this persona is visible in the community showcase';
COMMENT ON COLUMN personas.visibility IS 'Visibility level: private, community, public';
COMMENT ON COLUMN personas.portfolio_url IS 'External portfolio or website URL';
COMMENT ON COLUMN personas.views_count IS 'Number of times this persona has been viewed';
