-- Script SQL untuk membuat Storage Bucket 'archives'
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- Buat bucket 'archives' jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'archives',
  'archives',
  true,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Buat policies untuk bucket
-- Policy 1: Public dapat membaca file
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view archives bucket'
  ) THEN
    CREATE POLICY "Public can view archives bucket"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'archives');
  END IF;
END $$;

-- Policy 2: Authenticated users dapat upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload to archives'
  ) THEN
    CREATE POLICY "Authenticated users can upload to archives"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'archives' AND
        auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- Policy 3: Authenticated users dapat update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update archives'
  ) THEN
    CREATE POLICY "Authenticated users can update archives"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'archives' AND
        auth.role() = 'authenticated'
      )
      WITH CHECK (
        bucket_id = 'archives' AND
        auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- Policy 4: Authenticated users dapat delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete archives'
  ) THEN
    CREATE POLICY "Authenticated users can delete archives"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'archives' AND
        auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- Verifikasi bucket telah dibuat
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'archives';

