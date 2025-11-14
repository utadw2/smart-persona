-- Function to automatically set admin role for specific email
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user (make them admin)
  IF (SELECT COUNT(*) FROM profiles) = 0 THEN
    NEW.role := 'admin';
  -- Or check if email matches admin email from environment
  ELSIF NEW.email = current_setting('app.admin_email', true) THEN
    NEW.role := 'admin';
  ELSE
    NEW.role := 'user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set role on profile creation
DROP TRIGGER IF EXISTS set_admin_role_trigger ON profiles;
CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_role();

-- Update existing profiles to have 'user' role if not set
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Make role column NOT NULL with default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;
