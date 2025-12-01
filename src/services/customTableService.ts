import { supabase } from '../lib/supabase';

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'link';
  required: boolean;
  options?: string[]; // for select type
}

export interface CustomTable {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  columns: TableColumn[];
  created_at: string;
  updated_at: string;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

export const customTableService = {
  // Get all custom tables
  async getAll(): Promise<CustomTable[]> {
    const { data: tables, error: tablesError } = await supabase
      .from('custom_tables')
      .select('*')
      .order('created_at', { ascending: false });

    if (tablesError) {
      console.error('Error fetching custom tables:', tablesError);
      // If table doesn't exist, return empty array instead of throwing
      if (tablesError.code === '42P01' || tablesError.message?.includes('does not exist')) {
        console.warn('Custom tables table does not exist yet. Please run migrations.');
        return [];
      }
      throw new Error(`Gagal memuat tabel: ${tablesError.message}`);
    }
    if (!tables) return [];

    // Fetch columns for each table
    const tablesWithColumns = await Promise.all(
      tables.map(async (table) => {
        const { data: columns, error: columnsError } = await supabase
          .from('custom_table_columns')
          .select('*')
          .eq('table_id', table.id)
          .order('column_order', { ascending: true });

        if (columnsError) throw columnsError;

        return {
          id: table.id,
          name: table.name,
          description: table.description || undefined,
          is_public: table.is_public || false,
          columns: (columns || []).map((col) => ({
            id: col.id,
            name: col.name,
            type: col.type as TableColumn['type'],
            required: col.required,
            options: col.options && Array.isArray(col.options) ? col.options : undefined,
          })),
          created_at: table.created_at,
          updated_at: table.updated_at,
        };
      })
    );

    return tablesWithColumns;
  },

  // Create new table
  async create(table: Omit<CustomTable, 'id' | 'created_at' | 'updated_at'>): Promise<CustomTable> {
    // Create table record
    const { data: newTable, error: tableError } = await supabase
      .from('custom_tables')
      .insert({
        name: table.name,
        description: table.description || null,
        is_public: table.is_public || false,
      })
      .select()
      .single();

    if (tableError) {
      console.error('Error creating custom table:', tableError);
      throw new Error(`Gagal membuat tabel: ${tableError.message || 'Tabel tidak ditemukan. Pastikan migration sudah di-apply.'}`);
    }
    if (!newTable) throw new Error('Failed to create table');

    // Create columns
    if (table.columns.length > 0) {
      const columnsToInsert = table.columns.map((col, index) => ({
        table_id: newTable.id,
        name: col.name,
        type: col.type,
        required: col.required,
        options: col.options && col.options.length > 0 ? col.options : [],
        column_order: index,
      }));

      const { error: columnsError } = await supabase
        .from('custom_table_columns')
        .insert(columnsToInsert);

      if (columnsError) {
        console.error('Error creating custom table columns:', columnsError);
        // Rollback: delete the table if columns fail
        await supabase.from('custom_tables').delete().eq('id', newTable.id);
        throw new Error(`Gagal membuat kolom tabel: ${columnsError.message || 'Tabel kolom tidak ditemukan. Pastikan migration sudah di-apply.'}`);
      }
    }

    return {
      id: newTable.id,
      name: newTable.name,
      description: newTable.description || undefined,
      is_public: newTable.is_public || false,
      columns: table.columns,
      created_at: newTable.created_at,
      updated_at: newTable.updated_at,
    };
  },

  // Update table
  async update(tableId: string, updates: Partial<CustomTable>): Promise<void> {
    // Update table record
    const tableUpdates: any = {};
    if (updates.name !== undefined) tableUpdates.name = updates.name;
    if (updates.description !== undefined) tableUpdates.description = updates.description || null;
    if (updates.is_public !== undefined) tableUpdates.is_public = updates.is_public;
    tableUpdates.updated_at = new Date().toISOString();

    if (Object.keys(tableUpdates).length > 0) {
      const { error: tableError } = await supabase
        .from('custom_tables')
        .update(tableUpdates)
        .eq('id', tableId);

      if (tableError) throw tableError;
    }

    // Update columns if provided
    if (updates.columns !== undefined) {
      // Delete existing columns
      const { error: deleteError } = await supabase
        .from('custom_table_columns')
        .delete()
        .eq('table_id', tableId);

      if (deleteError) throw deleteError;

      // Insert new columns
      if (updates.columns.length > 0) {
        const columnsToInsert = updates.columns.map((col, index) => ({
          table_id: tableId,
          name: col.name,
          type: col.type,
          required: col.required,
          options: col.options && col.options.length > 0 ? col.options : [],
          column_order: index,
        }));

        const { error: columnsError } = await supabase
          .from('custom_table_columns')
          .insert(columnsToInsert);

        if (columnsError) throw columnsError;
      }
    }
  },

  // Delete table
  async delete(tableId: string): Promise<void> {
    // Cascade delete will handle columns and data
    const { error } = await supabase
      .from('custom_tables')
      .delete()
      .eq('id', tableId);

    if (error) throw error;
  },

  // Get table data
  async getTableData(tableId: string): Promise<TableRow[]> {
    const { data, error } = await supabase
      .from('custom_table_data')
      .select('*')
      .eq('table_id', tableId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match expected format
    return (data || []).map((row) => ({
      id: row.id,
      ...row.data,
    }));
  },

  async getTableDataPaged(
    tableId: string,
    options: { page: number; pageSize: number }
  ): Promise<{ data: TableRow[]; total: number; totalPages: number }> {
    const { page, pageSize } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('custom_table_data')
      .select('*', { count: 'exact' })
      .eq('table_id', tableId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total = count || 0;
    const rows =
      data?.map((row) => ({
        id: row.id,
        ...row.data,
      })) ?? [];

    return {
      data: rows,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  },

  // Get table data with pagination
  async getTableDataPaginated(options: {
    tableId: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: TableRow[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const { tableId, page, pageSize } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('custom_table_data')
      .select('*', { count: 'exact' })
      .eq('table_id', tableId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Transform data to match expected format
    const transformedData = (data || []).map((row) => ({
      id: row.id,
      ...row.data,
    }));

    return {
      data: transformedData,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Add row to table
  async addRow(tableId: string, row: Omit<TableRow, 'id'>): Promise<TableRow> {
    const { id, ...rowData } = row;
    const dataToStore = { ...rowData };

    const { data: newRow, error } = await supabase
      .from('custom_table_data')
      .insert({
        table_id: tableId,
        data: dataToStore,
      })
      .select()
      .single();

    if (error) throw error;
    if (!newRow) throw new Error('Failed to create row');

    return {
      id: newRow.id,
      ...newRow.data,
    };
  },

  // Update row
  async updateRow(tableId: string, rowId: string, updates: Partial<TableRow>): Promise<void> {
    // Get current row
    const { data: currentRow, error: fetchError } = await supabase
      .from('custom_table_data')
      .select('*')
      .eq('id', rowId)
      .eq('table_id', tableId)
      .single();

    if (fetchError) throw fetchError;
    if (!currentRow) throw new Error('Row not found');

    // Merge updates with existing data
    const { id, ...currentData } = currentRow.data as any;
    const updatedData = { ...currentData, ...updates };
    delete updatedData.id; // Ensure id is not in data

    const { error } = await supabase
      .from('custom_table_data')
      .update({
        data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rowId)
      .eq('table_id', tableId);

    if (error) throw error;
  },

  // Delete row
  async deleteRow(tableId: string, rowId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_table_data')
      .delete()
      .eq('id', rowId)
      .eq('table_id', tableId);

    if (error) throw error;
  },
};