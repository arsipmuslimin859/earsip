-- Add created_by column to custom_table_data if table exists and column doesn't exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'custom_table_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'custom_table_data' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE custom_table_data 
    ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for created_by if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'custom_table_data'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_custom_table_data_created_by ON custom_table_data(created_by);
  END IF;
END $$;

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

-- Drop trigger if exists, then create new one (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'custom_table_data'
  ) THEN
    DROP TRIGGER IF EXISTS validate_custom_table_data_trigger ON custom_table_data;
    
    CREATE TRIGGER validate_custom_table_data_trigger
      BEFORE INSERT OR UPDATE ON custom_table_data
      FOR EACH ROW
      EXECUTE FUNCTION validate_custom_table_data();
  END IF;
END $$;

-- Function to update updated_at on custom_tables
CREATE OR REPLACE FUNCTION update_custom_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create new one (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'custom_tables'
  ) THEN
    DROP TRIGGER IF EXISTS update_custom_tables_updated_at ON custom_tables;
    
    CREATE TRIGGER update_custom_tables_updated_at
      BEFORE UPDATE ON custom_tables
      FOR EACH ROW
      EXECUTE FUNCTION update_custom_table_updated_at();
  END IF;
END $$;

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

-- Drop trigger if exists, then create new one (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'custom_table_columns'
  ) THEN
    DROP TRIGGER IF EXISTS update_custom_table_columns_updated_at ON custom_table_columns;
    
    CREATE TRIGGER update_custom_table_columns_updated_at
      BEFORE UPDATE ON custom_table_columns
      FOR EACH ROW
      EXECUTE FUNCTION update_custom_table_columns_updated_at();
  END IF;
END $$;

