-- Branding, signatures, time-in/out, and share links

-- 1) profiles: license number + saved signature URL
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- 2) reports: time in/out, signatures, customer name, signed_at
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS time_in TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_out TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS technician_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS customer_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- 3) company_settings: single-row config for logo
CREATE TABLE IF NOT EXISTS public.company_settings (
  id SERIAL PRIMARY KEY,
  logo_url TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed a single settings row if none exists
INSERT INTO public.company_settings (logo_url)
SELECT NULL
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- 4) report_share_tokens: shareable links with optional expiry
CREATE TABLE IF NOT EXISTS public.report_share_tokens (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_share_tokens_report_id ON public.report_share_tokens(report_id);
CREATE INDEX IF NOT EXISTS idx_report_share_tokens_token ON public.report_share_tokens(token);

-- 5) RLS policies
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_share_tokens ENABLE ROW LEVEL SECURITY;

-- company_settings: everyone authenticated can read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_settings' AND policyname = 'company_settings_select_all_auth'
  ) THEN
    CREATE POLICY "company_settings_select_all_auth" ON public.company_settings
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- company_settings: only managers/admins can update
-- We check the caller's role via the profiles table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_settings' AND policyname = 'company_settings_update_mgr_admin'
  ) THEN
    CREATE POLICY "company_settings_update_mgr_admin" ON public.company_settings
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('manager','admin')
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;

-- report_share_tokens: authors, managers, admins can manage their tokens
-- Select: creator or managers/admins can see their own tokens; general clients shouldn't need select
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_share_tokens' AND policyname = 'report_share_tokens_select_limit'
  ) THEN
    CREATE POLICY "report_share_tokens_select_limit" ON public.report_share_tokens
      FOR SELECT USING (
        (created_by = auth.uid()) OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;

-- Insert: Only report author or managers/admins
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_share_tokens' AND policyname = 'report_share_tokens_insert_author_or_mgr_admin'
  ) THEN
    CREATE POLICY "report_share_tokens_insert_author_or_mgr_admin" ON public.report_share_tokens
      FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL) AND (
          EXISTS (
            SELECT 1 FROM public.reports r
            WHERE r.id = report_id AND r.author_id = auth.uid()
          ) OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
          )
        )
      );
  END IF;
END $$;

-- Update/Delete: Only creator or managers/admins
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_share_tokens' AND policyname = 'report_share_tokens_update_creator_or_mgr_admin'
  ) THEN
    CREATE POLICY "report_share_tokens_update_creator_or_mgr_admin" ON public.report_share_tokens
      FOR UPDATE USING (
        (created_by = auth.uid()) OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      ) WITH CHECK (
        (created_by = auth.uid()) OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_share_tokens' AND policyname = 'report_share_tokens_delete_creator_or_mgr_admin'
  ) THEN
    CREATE POLICY "report_share_tokens_delete_creator_or_mgr_admin" ON public.report_share_tokens
      FOR DELETE USING (
        (created_by = auth.uid()) OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;


