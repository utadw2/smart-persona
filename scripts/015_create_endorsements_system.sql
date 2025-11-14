-- Create endorsements table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  endorser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(persona_id, skill, endorser_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_endorsements_persona ON skill_endorsements(persona_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_skill ON skill_endorsements(skill);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON skill_endorsements(endorser_id);

-- Enable RLS
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "endorsements_select_all" ON skill_endorsements FOR SELECT USING (true);
CREATE POLICY "endorsements_insert_own" ON skill_endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "endorsements_delete_own" ON skill_endorsements FOR DELETE USING (auth.uid() = endorser_id);

-- Function to get endorsement count for a skill
CREATE OR REPLACE FUNCTION get_skill_endorsement_count(p_persona_id UUID, p_skill TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER 
  FROM skill_endorsements 
  WHERE persona_id = p_persona_id AND skill = p_skill;
$$ LANGUAGE SQL STABLE;

-- Trigger to create notification on endorsement
CREATE OR REPLACE FUNCTION notify_on_endorsement()
RETURNS TRIGGER AS $$
DECLARE
  endorser_name TEXT;
  persona_owner_id UUID;
BEGIN
  SELECT full_name INTO endorser_name FROM profiles WHERE id = NEW.endorser_id;
  SELECT user_id INTO persona_owner_id FROM personas WHERE id = NEW.persona_id;
  
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (
    persona_owner_id,
    'endorsement',
    'New Skill Endorsement',
    endorser_name || ' endorsed your ' || NEW.skill || ' skill',
    '/community/personas/' || NEW.persona_id,
    jsonb_build_object('endorser_id', NEW.endorser_id, 'skill', NEW.skill, 'persona_id', NEW.persona_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER endorsement_notification_trigger
AFTER INSERT ON skill_endorsements
FOR EACH ROW
EXECUTE FUNCTION notify_on_endorsement();
