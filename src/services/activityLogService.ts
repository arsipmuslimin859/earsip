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

  async query(filters?: {
    action?: string;
    userId?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters?.limit ?? 100);

    if (filters?.action) {
      query = query.ilike('action', `%${filters.action}%`);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.entityType) {
      query = query.ilike('entity_type', `%${filters.entityType}%`);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ActivityLog[];
  },

  async getPaginated(options: {
    page: number;
    pageSize: number;
    action?: string;
    userId?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page, pageSize, action, userId, entityType, dateFrom, dateTo } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (action) {
      query = query.ilike('action', `%${action}%`);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (entityType) {
      query = query.ilike('entity_type', `%${entityType}%`);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      data: data as ActivityLog[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },
};
