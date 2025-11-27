-- Ensure custom_tables table exists
CREATE TABLE IF NOT EXISTS custom_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

-- Ensure custom_table_columns table exists
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

-- Ensure custom_table_data table exists
CREATE TABLE IF NOT EXISTS custom_table_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES custom_tables(id) ON DELETE CASCADE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE custom_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_table_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_table_data ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist (using DO block to avoid errors)
DO $$
BEGIN
  -- Custom tables policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_tables' 
    AND policyname = 'Authenticated users can read custom tables'
  ) THEN
    CREATE POLICY "Authenticated users can read custom tables"
      ON custom_tables FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_tables' 
    AND policyname = 'Authenticated users can insert custom tables'
  ) THEN
    CREATE POLICY "Authenticated users can insert custom tables"
      ON custom_tables FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_tables' 
    AND policyname = 'Authenticated users can update custom tables'
  ) THEN
    CREATE POLICY "Authenticated users can update custom tables"
      ON custom_tables FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_tables' 
    AND policyname = 'Authenticated users can delete custom tables'
  ) THEN
    CREATE POLICY "Authenticated users can delete custom tables"
      ON custom_tables FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  -- Custom table columns policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_columns' 
    AND policyname = 'Authenticated users can read custom table columns'
  ) THEN
    CREATE POLICY "Authenticated users can read custom table columns"
      ON custom_table_columns FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_columns' 
    AND policyname = 'Authenticated users can insert custom table columns'
  ) THEN
    CREATE POLICY "Authenticated users can insert custom table columns"
      ON custom_table_columns FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_columns' 
    AND policyname = 'Authenticated users can update custom table columns'
  ) THEN
    CREATE POLICY "Authenticated users can update custom table columns"
      ON custom_table_columns FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_columns' 
    AND policyname = 'Authenticated users can delete custom table columns'
  ) THEN
    CREATE POLICY "Authenticated users can delete custom table columns"
      ON custom_table_columns FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  -- Custom table data policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_data' 
    AND policyname = 'Authenticated users can read custom table data'
  ) THEN
    CREATE POLICY "Authenticated users can read custom table data"
      ON custom_table_data FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_data' 
    AND policyname = 'Authenticated users can insert custom table data'
  ) THEN
    CREATE POLICY "Authenticated users can insert custom table data"
      ON custom_table_data FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_data' 
    AND policyname = 'Authenticated users can update custom table data'
  ) THEN
    CREATE POLICY "Authenticated users can update custom table data"
      ON custom_table_data FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_table_data' 
    AND policyname = 'Authenticated users can delete custom table data'
  ) THEN
    CREATE POLICY "Authenticated users can delete custom table data"
      ON custom_table_data FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_custom_table_columns_table_id ON custom_table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_custom_table_columns_order ON custom_table_columns(table_id, column_order);
CREATE INDEX IF NOT EXISTS idx_custom_table_data_table_id ON custom_table_data(table_id);
CREATE INDEX IF NOT EXISTS idx_custom_table_data_created_at ON custom_table_data(table_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_table_data_created_by ON custom_table_data(created_by);

