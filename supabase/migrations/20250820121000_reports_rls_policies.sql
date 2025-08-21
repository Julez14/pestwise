-- Enable RLS and add simple policies if not present
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Select: authenticated can read (adjust as needed)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_select_all_auth'
  ) THEN
    CREATE POLICY "reports_select_all_auth" ON public.reports
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Insert: authenticated users can insert their own report
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_insert_self'
  ) THEN
    CREATE POLICY "reports_insert_self" ON public.reports
      FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

-- Update: author OR manager/admin can update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_update_author_or_mgr_admin'
  ) THEN
    CREATE POLICY "reports_update_author_or_mgr_admin" ON public.reports
      FOR UPDATE USING (
        (auth.uid() = author_id) OR EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      ) WITH CHECK (
        (auth.uid() = author_id) OR EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;


