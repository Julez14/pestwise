-- Storage RLS policies for branding and signatures buckets

-- signatures: allow authenticated users to upload and read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'signatures_select_all'
  ) THEN
    CREATE POLICY "signatures_select_all" ON storage.objects
      FOR SELECT USING (bucket_id = 'signatures');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'signatures_insert_auth'
  ) THEN
    CREATE POLICY "signatures_insert_auth" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'signatures' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- branding: allow reads for all; allow managers/admins to upload/update
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'branding_select_all'
  ) THEN
    CREATE POLICY "branding_select_all" ON storage.objects
      FOR SELECT USING (bucket_id = 'branding');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'branding_insert_mgr_admin'
  ) THEN
    CREATE POLICY "branding_insert_mgr_admin" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'branding' AND EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'branding_update_mgr_admin'
  ) THEN
    CREATE POLICY "branding_update_mgr_admin" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'branding' AND EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      ) WITH CHECK (
        bucket_id = 'branding' AND EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager','admin')
        )
      );
  END IF;
END $$;


