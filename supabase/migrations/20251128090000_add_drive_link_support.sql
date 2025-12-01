-- Add external URL support for archives stored outside Supabase storage
ALTER TABLE archives
  ADD COLUMN IF NOT EXISTS external_url text;

-- Allow archives without an internal storage path when using external links
ALTER TABLE archives
  ALTER COLUMN file_path DROP NOT NULL;

-- Add is_public column to custom_tables for public visibility
ALTER TABLE custom_tables
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
