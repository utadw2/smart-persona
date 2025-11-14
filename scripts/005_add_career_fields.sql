-- Add career, education, and projects fields to personas table
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS job_preferences JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN personas.career IS 'Career information: title, experience_years, industry, specializations';
COMMENT ON COLUMN personas.education IS 'Education information: degree, field, institution, graduation_year';
COMMENT ON COLUMN personas.projects IS 'Array of projects: title, description, technologies, link';
COMMENT ON COLUMN personas.job_preferences IS 'Job preferences: remote, location, job_types, salary_range';

-- Create jobs table for job listings
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  location TEXT,
  remote BOOLEAN DEFAULT false,
  job_type TEXT, -- full-time, part-time, contract, freelance
  salary_min INTEGER,
  salary_max INTEGER,
  industry TEXT,
  experience_required INTEGER, -- years
  posted_date DATE DEFAULT CURRENT_DATE,
  application_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active jobs
CREATE POLICY "Authenticated users can view active jobs"
ON jobs FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Admins can manage all jobs
CREATE POLICY "Admins can manage all jobs"
ON jobs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create job_matches table to track user interest
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_score INTEGER, -- 0-100
  status TEXT DEFAULT 'interested', -- interested, applied, rejected, saved
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS on job_matches
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own job matches
CREATE POLICY "Users can view their own job matches"
ON job_matches FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own job matches"
ON job_matches FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own job matches"
ON job_matches FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own job matches"
ON job_matches FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admins can view all job matches
CREATE POLICY "Admins can view all job matches"
ON job_matches FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create index for faster job matching queries
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
CREATE INDEX IF NOT EXISTS idx_job_matches_user ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_persona ON job_matches(persona_id);
