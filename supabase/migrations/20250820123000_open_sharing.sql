-- Loosen sharing: allow any authenticated user to create share links for any report

-- Drop previous restrictive INSERT policy if exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_share_tokens' AND policyname = 'report_share_tokens_insert_author_or_mgr_admin'
  ) THEN
    DROP POLICY "report_share_tokens_insert_author_or_mgr_admin" ON public.report_share_tokens;
  END IF;
END $$;

-- Create permissive INSERT policy for any authenticated user
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_share_tokens' AND policyname = 'report_share_tokens_insert_any_auth'
  ) THEN
    CREATE POLICY "report_share_tokens_insert_any_auth" ON public.report_share_tokens
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;


