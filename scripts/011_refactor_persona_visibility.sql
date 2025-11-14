-- Refactor persona visibility system
-- Replace is_active with visibility enum for clearer status management

-- Add visibility column if it doesn't exist (it already exists from previous migrations)
-- Update existing data: is_active true -> published, is_active false -> private
UPDATE personas 
SET visibility = CASE 
  WHEN is_active = true THEN 'published'
  ELSE 'private'
END
WHERE visibility IS NULL OR visibility NOT IN ('published', 'private');

-- Ensure all personas have a visibility value
UPDATE personas 
SET visibility = 'private' 
WHERE visibility IS NULL;

-- Make visibility NOT NULL
ALTER TABLE personas ALTER COLUMN visibility SET NOT NULL;
ALTER TABLE personas ALTER COLUMN visibility SET DEFAULT 'private';

-- Keep is_active for backward compatibility but sync it with visibility
-- Create trigger to keep is_active in sync with visibility
CREATE OR REPLACE FUNCTION sync_persona_visibility()
RETURNS TRIGGER AS $$
BEGIN
  -- When visibility changes, update is_active
  IF NEW.visibility = 'published' THEN
    NEW.is_active = true;
  ELSE
    NEW.is_active = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_persona_visibility_trigger ON personas;
CREATE TRIGGER sync_persona_visibility_trigger
  BEFORE INSERT OR UPDATE OF visibility ON personas
  FOR EACH ROW
  EXECUTE FUNCTION sync_persona_visibility();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_personas_visibility ON personas(visibility);
CREATE INDEX IF NOT EXISTS idx_personas_user_visibility ON personas(user_id, visibility);
