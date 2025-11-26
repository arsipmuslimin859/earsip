import { supabase } from '../lib/supabase';
import type { Tag } from '../types';

export const tagService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Tag[];
  },

  async create(tag: Omit<Tag, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<Tag, 'id'>>) {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addToArchive(archiveId: string, tagId: string) {
    const { error } = await supabase
      .from('archive_tags')
      .insert({ archive_id: archiveId, tag_id: tagId });

    if (error) throw error;
  },

  async removeFromArchive(archiveId: string, tagId: string) {
    const { error } = await supabase
      .from('archive_tags')
      .delete()
      .eq('archive_id', archiveId)
      .eq('tag_id', tagId);

    if (error) throw error;
  },

  async getByArchiveId(archiveId: string) {
    const { data, error } = await supabase
      .from('archive_tags')
      .select('tag:tags(*)')
      .eq('archive_id', archiveId);

    if (error) throw error;
    return data.map(item => item.tag) as Tag[];
  },
};
