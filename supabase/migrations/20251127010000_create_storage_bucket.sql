-- Create storage bucket for archives
-- This migration creates the 'archives' bucket in Supabase Storage if it doesn't exist

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'archives',
  'archives',
  true,
  52428800, -- 50MB default limit
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

-- Create storage policies for the bucket using DO block to avoid errors
DO $$
BEGIN
  -- Allow public read access to archives bucket
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

  -- Allow authenticated users to upload files to archives bucket
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

  -- Allow authenticated users to update files in archives bucket
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

  -- Allow authenticated users to delete files from archives bucket
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

