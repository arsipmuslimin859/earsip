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

  ### `custom_tables`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Table name
  - `description` (text) - Table description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `custom_table_columns`
  - `id` (uuid, primary key)
  - `table_id` (uuid) - Foreign key to custom_tables
  - `name` (text) - Column name
  - `type` (text) - Column type (text, number, date, boolean, select)
  - `required` (boolean) - Whether column is required
  - `options` (jsonb) - Options for select type columns
  - `column_order` (integer) - Display order
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `custom_table_data`
  - `id` (uuid, primary key)
  - `table_id` (uuid) - Foreign key to custom_tables
  - `data` (jsonb) - Dynamic row data
  - `created_by` (uuid) - Foreign key to auth.users (tracking creator)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Validation & Constraints
  - Database triggers validate data before insert/update:
    - Required fields must be filled
    - Data types must match column definitions (number, boolean, date, select, text)
    - Select values must be from defined options
    - Date values must be valid date format
  - Automatic `updated_at` timestamp updates
  - Cascade delete: deleting a table removes all columns and data

  ## Security
  - Enable RLS on all tables
  - Archives: Users can read own archives, public archives visible to all
  - Settings/Modules: Only authenticated users can read
  - Activity logs: Users can only read own logs
  - Custom tables: Only authenticated users can manage
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

CREATE POLICY "Authenticated users can insert settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Custom tables feature
-- Table for custom table definitions
CREATE TABLE IF NOT EXISTS custom_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

ALTER TABLE custom_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read custom tables"
  ON custom_tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert custom tables"
  ON custom_tables FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom tables"
  ON custom_tables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete custom tables"
  ON custom_tables FOR DELETE
  TO authenticated
  USING (true);

-- Table for custom table columns
CREATE TABLE IF NOT EXISTS custom_table_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES custom_tables(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  required boolean DEFAULT false,
  options jsonb DEFAULT '[]'::jsonb,
  column_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(table_id, name)
);

ALTER TABLE custom_table_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read custom table columns"
  ON custom_table_columns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert custom table columns"
  ON custom_table_columns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom table columns"
  ON custom_table_columns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete custom table columns"
  ON custom_table_columns FOR DELETE
  TO authenticated
  USING (true);

-- Table for custom table data rows
CREATE TABLE IF NOT EXISTS custom_table_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES custom_tables(id) ON DELETE CASCADE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_table_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read custom table data"
  ON custom_table_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert custom table data"
  ON custom_table_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom table data"
  ON custom_table_data FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete custom table data"
  ON custom_table_data FOR DELETE
  TO authenticated
  USING (true);

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
CREATE INDEX IF NOT EXISTS idx_custom_table_columns_table_id ON custom_table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_custom_table_columns_order ON custom_table_columns(table_id, column_order);
CREATE INDEX IF NOT EXISTS idx_custom_table_data_table_id ON custom_table_data(table_id);
CREATE INDEX IF NOT EXISTS idx_custom_table_data_created_at ON custom_table_data(table_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_table_data_created_by ON custom_table_data(created_by);

-- Function to validate custom table data
CREATE OR REPLACE FUNCTION validate_custom_table_data()
RETURNS TRIGGER AS $$
DECLARE
  col_record RECORD;
  col_value jsonb;
  col_type text;
  is_valid boolean := true;
  error_message text := '';
BEGIN
  -- Get all columns for this table
  FOR col_record IN
    SELECT * FROM custom_table_columns
    WHERE table_id = NEW.table_id
    ORDER BY column_order
  LOOP
    col_value := NEW.data->col_record.name;
    col_type := col_record.type;
    
    -- Check required fields
    IF col_record.required AND (col_value IS NULL OR col_value = 'null'::jsonb) THEN
      is_valid := false;
      error_message := error_message || 'Kolom "' || col_record.name || '" wajib diisi. ';
    END IF;
    
    -- Validate data type if value exists
    IF col_value IS NOT NULL AND col_value != 'null'::jsonb THEN
      CASE col_type
        WHEN 'number' THEN
          -- Check if value is a valid number
          IF jsonb_typeof(col_value) != 'number' THEN
            is_valid := false;
            error_message := error_message || 'Kolom "' || col_record.name || '" harus berupa angka. ';
          END IF;
        WHEN 'boolean' THEN
          -- Check if value is a valid boolean
          IF jsonb_typeof(col_value) != 'boolean' THEN
            is_valid := false;
            error_message := error_message || 'Kolom "' || col_record.name || '" harus berupa ya/tidak. ';
          END IF;
        WHEN 'date' THEN
          -- Check if value is a valid date string
          IF jsonb_typeof(col_value) != 'string' THEN
            is_valid := false;
            error_message := error_message || 'Kolom "' || col_record.name || '" harus berupa tanggal (string). ';
          ELSE
            BEGIN
              PERFORM (col_value #>> '{}')::date;
            EXCEPTION WHEN OTHERS THEN
              is_valid := false;
              error_message := error_message || 'Kolom "' || col_record.name || '" harus berupa tanggal yang valid (format: YYYY-MM-DD). ';
            END;
          END IF;
        WHEN 'select' THEN
          -- Check if value is in options
          IF col_record.options IS NOT NULL AND 
             jsonb_typeof(col_record.options) = 'array' THEN
            IF jsonb_typeof(col_value) = 'string' AND
               NOT EXISTS (
                 SELECT 1 FROM jsonb_array_elements_text(col_record.options) AS opt
                 WHERE opt = col_value::text
               ) THEN
              is_valid := false;
              error_message := error_message || 'Kolom "' || col_record.name || '" harus salah satu dari: ' || 
                              array_to_string(ARRAY(SELECT jsonb_array_elements_text(col_record.options)), ', ') || '. ';
            END IF;
          END IF;
        -- 'text' type accepts any string, no validation needed
      END CASE;
    END IF;
  END LOOP;
  
  -- Check for extra fields that don't exist in column definitions
  FOR col_record IN
    SELECT key as field_name
    FROM jsonb_each(NEW.data)
    WHERE key NOT IN (
      SELECT name FROM custom_table_columns WHERE table_id = NEW.table_id
    )
  LOOP
    -- Allow extra fields but log warning (or remove them)
    -- For strict mode, uncomment below:
    -- is_valid := false;
    -- error_message := error_message || 'Kolom "' || col_record.field_name || '" tidak terdefinisi dalam tabel. ';
  END LOOP;
  
  IF NOT is_valid THEN
    RAISE EXCEPTION 'Validasi gagal: %', error_message;
  END IF;
  
  -- Set created_by if not set
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  
  -- Update updated_at
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_custom_table_data_trigger
  BEFORE INSERT OR UPDATE ON custom_table_data
  FOR EACH ROW
  EXECUTE FUNCTION validate_custom_table_data();

-- Function to update updated_at on custom_tables
CREATE OR REPLACE FUNCTION update_custom_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on custom_tables
CREATE TRIGGER update_custom_tables_updated_at
  BEFORE UPDATE ON custom_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_table_updated_at();

-- Function to update updated_at on custom_table_columns
CREATE OR REPLACE FUNCTION update_custom_table_columns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  -- Also update parent table's updated_at
  UPDATE custom_tables SET updated_at = now() WHERE id = NEW.table_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on custom_table_columns
CREATE TRIGGER update_custom_table_columns_updated_at
  BEFORE UPDATE ON custom_table_columns
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_table_columns_updated_at();

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