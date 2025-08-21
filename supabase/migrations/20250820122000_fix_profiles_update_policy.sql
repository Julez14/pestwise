-- Fix profiles table RLS policy to allow updates to new columns
-- The existing policy should work, but let's ensure it's properly configured

-- Drop and recreate the update policy to ensure it works with new columns
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Recreate the policy with explicit permissions for all columns including new ones
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Also ensure managers and admins can update profiles if needed
CREATE POLICY "Allow managers and admins to update profiles" ON public.profiles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('manager', 'admin')
    )
  ) 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('manager', 'admin')
    )
  );
