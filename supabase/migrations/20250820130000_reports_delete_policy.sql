-- Add DELETE policy for reports to allow author and supervisor/manager/admin
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_delete_author_or_mgr_admin'
  ) THEN
    CREATE POLICY "reports_delete_author_or_mgr_admin" ON public.reports
      FOR DELETE USING (
        (auth.uid() = author_id) OR EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('supervisor','manager','admin')
        )
      );
  END IF;
END $$;
