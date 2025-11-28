-- Add external URL support for archives stored outside Supabase storage
ALTER TABLE archives
  ADD COLUMN IF NOT EXISTS external_url text;

-- Allow archives without an internal storage path when using external links
ALTER TABLE archives
  ALTER COLUMN file_path DROP NOT NULL;

