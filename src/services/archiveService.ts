import { supabase } from '../lib/supabase';
import type { Archive, ArchiveMetadata } from '../types';

export const archiveService = {
  async getAll(isPublicOnly = false) {
    let query = supabase
      .from('archives')
      .select(`
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `)
      .order('created_at', { ascending: false });

    if (isPublicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Archive[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('archives')
      .select(`
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Archive | null;
  },

  async create(archive: {
    title: string;
    description?: string;
    category_id?: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_type: string;
    is_public: boolean;
    uploaded_by: string;
  }) {
    const { data, error } = await supabase
      .from('archives')
      .insert(archive)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Archive>) {
    const { data, error } = await supabase
      .from('archives')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('archives')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('archives')
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  async getFileUrl(path: string) {
    const { data } = supabase.storage
      .from('archives')
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('archives')
      .remove([path]);

    if (error) throw error;
  },

  async search(query: string, filters?: {
    category_id?: string;
    is_public?: boolean;
    tags?: string[];
  }) {
    let dbQuery = supabase
      .from('archives')
      .select(`
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (filters?.category_id) {
      dbQuery = dbQuery.eq('category_id', filters.category_id);
    }

    if (filters?.is_public !== undefined) {
      dbQuery = dbQuery.eq('is_public', filters.is_public);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;

    return data as Archive[];
  },
};

export const metadataService = {
  async create(metadata: Omit<ArchiveMetadata, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('archive_metadata')
      .insert(metadata)
      .select();

    if (error) throw error;
    return data;
  },

  async update(archiveId: string, metadata: { field_name: string; field_value: string; field_type: string }[]) {
    await supabase
      .from('archive_metadata')
      .delete()
      .eq('archive_id', archiveId);

    const { data, error } = await supabase
      .from('archive_metadata')
      .insert(
        metadata.map(m => ({
          archive_id: archiveId,
          ...m,
        }))
      )
      .select();

    if (error) throw error;
    return data;
  },

  async getByArchiveId(archiveId: string) {
    const { data, error } = await supabase
      .from('archive_metadata')
      .select('*')
      .eq('archive_id', archiveId);

    if (error) throw error;
    return data as ArchiveMetadata[];
  },
};
