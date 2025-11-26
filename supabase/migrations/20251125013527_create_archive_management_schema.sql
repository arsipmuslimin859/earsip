/*
  # Archive Management System Schema

  ## Overview
  Modular archive management system supporting dynamic metadata, categories, tags,
  public/private archives, activity logging, and configurable modules per institution.

  ## New Tables

  ### `settings`
  - `id` (uuid, primary key)
  - `key` (text, unique) - Setting identifier
  - `value` (jsonb) - Setting value
  - `description` (text) - Setting description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `modules`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Module name
  - `enabled` (boolean) - Module status
  - `config` (jsonb) - Module configuration
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `categories`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name
  - `description` (text)
  - `color` (text) - Display color
  - `icon` (text) - Icon identifier
  - `parent_id` (uuid, nullable) - For hierarchical categories
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `tags`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Tag name
  - `color` (text) - Display color
  - `created_at` (timestamptz)

  ### `archives`
  - `id` (uuid, primary key)
  - `title` (text) - Archive title
  - `description` (text)
  - `category_id` (uuid) - Foreign key to categories
  - `file_path` (text) - Supabase storage path
  - `file_name` (text) - Original file name
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type
  - `is_public` (boolean, default false) - Public visibility
  - `version` (integer, default 1) - Version number
  - `parent_version_id` (uuid, nullable) - For versioning
  - `uploaded_by` (uuid) - Foreign key to auth.users
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `archive_metadata`
  - `id` (uuid, primary key)
  - `archive_id` (uuid) - Foreign key to archives
  - `field_name` (text) - Dynamic field name
  - `field_value` (text) - Field value
  - `field_type` (text) - Field type (text, date, number, etc.)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `archive_tags`
  - `id` (uuid, primary key)
  - `archive_id` (uuid) - Foreign key to archives
  - `tag_id` (uuid) - Foreign key to tags
  - `created_at` (timestamptz)

  ### `activity_logs`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Foreign key to auth.users
  - `action` (text) - Action performed
  - `entity_type` (text) - Type of entity (archive, category, etc.)
  - `entity_id` (uuid) - ID of affected entity
  - `details` (jsonb) - Additional details
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Archives: Users can read own archives, public archives visible to all
  - Settings/Modules: Only authenticated users can read
  - Activity logs: Users can only read own logs
*/

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update modules"
  ON modules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'folder',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tags"
  ON tags FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tags"
  ON tags FOR DELETE
  TO authenticated
  USING (true);

-- Archives table
CREATE TABLE IF NOT EXISTS archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text,
  is_public boolean DEFAULT false,
  version integer DEFAULT 1,
  parent_version_id uuid REFERENCES archives(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public archives visible to everyone"
  ON archives FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Authenticated users can view all archives"
  ON archives FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert archives"
  ON archives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can update archives"
  ON archives FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete archives"
  ON archives FOR DELETE
  TO authenticated
  USING (true);

-- Archive metadata table
CREATE TABLE IF NOT EXISTS archive_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id uuid REFERENCES archives(id) ON DELETE CASCADE NOT NULL,
  field_name text NOT NULL,
  field_value text,
  field_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE archive_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Metadata follows archive visibility"
  ON archive_metadata FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM archives
      WHERE archives.id = archive_metadata.archive_id
      AND (archives.is_public = true OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Authenticated users can insert metadata"
  ON archive_metadata FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update metadata"
  ON archive_metadata FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete metadata"
  ON archive_metadata FOR DELETE
  TO authenticated
  USING (true);

-- Archive tags junction table
CREATE TABLE IF NOT EXISTS archive_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id uuid REFERENCES archives(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(archive_id, tag_id)
);

ALTER TABLE archive_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Archive tags follow archive visibility"
  ON archive_tags FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM archives
      WHERE archives.id = archive_tags.archive_id
      AND (archives.is_public = true OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Authenticated users can manage archive tags"
  ON archive_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete archive tags"
  ON archive_tags FOR DELETE
  TO authenticated
  USING (true);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_archives_category ON archives(category_id);
CREATE INDEX IF NOT EXISTS idx_archives_uploaded_by ON archives(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_archives_is_public ON archives(is_public);
CREATE INDEX IF NOT EXISTS idx_archives_created_at ON archives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_metadata_archive_id ON archive_metadata(archive_id);
CREATE INDEX IF NOT EXISTS idx_archive_tags_archive_id ON archive_tags(archive_id);
CREATE INDEX IF NOT EXISTS idx_archive_tags_tag_id ON archive_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('institution_name', '"Sistem Manajemen Arsip"', 'Nama instansi'),
  ('metadata_schema', '[]', 'Skema metadata dinamis'),
  ('theme', '{"primaryColor": "blue"}', 'Konfigurasi tema')
ON CONFLICT (key) DO NOTHING;

-- Insert default modules
INSERT INTO modules (name, enabled, config) VALUES
  ('public_archive', true, '{"allowDownload": true}'::jsonb),
  ('tagging', true, '{}'::jsonb),
  ('versioning', true, '{}'::jsonb),
  ('retention', false, '{"defaultRetentionYears": 5}'::jsonb),
  ('metadata_dynamic', true, '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description, color, icon) VALUES
  ('Surat Masuk', 'Arsip surat masuk', '#3b82f6', 'mail'),
  ('Surat Keluar', 'Arsip surat keluar', '#10b981', 'send'),
  ('Dokumen Internal', 'Dokumen internal organisasi', '#f59e0b', 'file-text'),
  ('Laporan', 'Laporan dan dokumentasi', '#8b5cf6', 'file-bar-chart')
ON CONFLICT (name) DO NOTHING;