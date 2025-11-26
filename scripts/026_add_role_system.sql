-- Add new role types for the system
-- Roles: user, company, admin, super_admin

-- Update the role column to support new role types
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add constraint for the 4 role types
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'company', 'admin', 'super_admin'));

-- Add account_type column to community_posts to track who posted
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS author_role text DEFAULT 'user';
ALTER TABLE community_posts ADD CONSTRAINT posts_author_role_check 
  CHECK (author_role IN ('user', 'company', 'admin', 'super_admin'));

-- Create index for filtering posts by author role
CREATE INDEX IF NOT EXISTS idx_community_posts_author_role ON community_posts(author_role);

-- Update existing posts to set author_role based on user's role
UPDATE community_posts
SET author_role = profiles.role
FROM profiles
WHERE community_posts.user_id = profiles.id
AND community_posts.author_role = 'user';

-- Create function to automatically set author_role when creating posts
CREATE OR REPLACE FUNCTION set_post_author_role()
RETURNS TRIGGER AS $$
BEGIN
  SELECT role INTO NEW.author_role
  FROM profiles
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set author_role
DROP TRIGGER IF EXISTS trigger_set_post_author_role ON community_posts;
CREATE TRIGGER trigger_set_post_author_role
  BEFORE INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_post_author_role();

-- Add RLS policy for super_admin to manage admin roles
CREATE POLICY "super_admin_manage_roles" ON profiles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- Grant super_admin ability to update any profile role
CREATE POLICY "super_admin_update_all_profiles" ON profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

COMMENT ON COLUMN profiles.role IS 'User role: user (regular user), company (company account), admin (admin), super_admin (super administrator with full access)';
COMMENT ON COLUMN community_posts.author_role IS 'Role of the user who created the post, copied from profiles.role at creation time';
