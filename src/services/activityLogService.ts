import { supabase } from '../lib/supabase';
import type { ActivityLog } from '../types';

export const activityLogService = {
  async create(log: {
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: Record<string, unknown>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user?.id || null,
        ...log,
        details: log.details || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ActivityLog[];
  },

  async getByEntityId(entityId: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ActivityLog[];
  },
};
