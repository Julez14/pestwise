-- Drop foreign key constraints that depend on the public.users table
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_author_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

-- Drop indexes on the author_id columns
DROP INDEX IF EXISTS idx_reports_author;
DROP INDEX IF EXISTS idx_comments_author;

-- Drop the existing public.users table
DROP TABLE IF EXISTS public.users;

-- Create a new 'profiles' table to store public user data
-- This table will be linked to the auth.users table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'technician',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter author_id columns in reports and comments to be UUIDs
-- We use USING (NULL::uuid) to discard the old integer-based author_id
-- values, as they cannot be cast to UUIDs.
ALTER TABLE public.reports
  ALTER COLUMN author_id TYPE UUID USING (NULL::uuid);
ALTER TABLE public.comments
  ALTER COLUMN author_id TYPE UUID USING (NULL::uuid);

-- Add foreign key constraints to reference the new profiles table
-- Note: We reference auth.users(id) directly for data integrity
ALTER TABLE public.reports
  ADD CONSTRAINT reports_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Recreate indexes on the updated author_id columns
CREATE INDEX IF NOT EXISTS idx_reports_author ON public.reports(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);

-- Secure the 'profiles' table with Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the 'profiles' table
-- 1. Allow users to read all profiles (adjust as needed for your app's privacy)
CREATE POLICY "Allow all users to view profiles" ON public.profiles
  FOR SELECT USING (true);

-- 2. Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- This function will be triggered when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the function after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
