import { supabase } from '../lib/supabase';
import type { Archive, ArchiveMetadata } from '../types';
import institutionConfig from '../config/institution.config.json';

// Get bucket name from config
const BUCKET_NAME = institutionConfig.storage.bucketName || 'archives';

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

  async checkBucketExists(): Promise<boolean> {
    try {
      console.log('Checking bucket existence for:', BUCKET_NAME);
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Error checking buckets:', error);
        console.error('Error details:', {
          message: error.message,
          details: error
        });
        return false;
      }
      console.log('Available buckets:', data?.map(b => b.name));
      const exists = data?.some(bucket => bucket.name === BUCKET_NAME) ?? false;
      console.log(`Bucket "${BUCKET_NAME}" exists:`, exists);
      return exists;
    } catch (error) {
      console.error('Error checking bucket existence:', error);
      console.error('Error details:', error);
      return false;
    }
  },

  async createBucketIfNotExists(): Promise<boolean> {
    try {
      const exists = await this.checkBucketExists();
      if (exists) {
        console.log(`Bucket "${BUCKET_NAME}" already exists`);
        return true;
      }

      console.log(`Bucket "${BUCKET_NAME}" does not exist, attempting to create...`);

      // Try creating bucket via API
      const { error: apiError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/jpg',
          'image/png'
        ],
        fileSizeLimit: 52428800 // 50MB
      });

      if (!apiError) {
        console.log(`Bucket "${BUCKET_NAME}" created successfully via API`);
        return true;
      }

      console.warn('API bucket creation failed:', apiError);
      console.log('Please create the bucket manually in Supabase Dashboard:');
      console.log('1. Go to Supabase Dashboard > Storage');
      console.log('2. Click "Create Bucket"');
      console.log('3. Name: "archives"');
      console.log('4. Check "Public bucket"');
      console.log('5. Or run the setup_bucket.sql file in SQL Editor');

      // Don't return false immediately, let the user create it manually
      // We'll check again in uploadFile
      return false;
    } catch (error) {
      console.error('Error in createBucketIfNotExists:', error);
      return false;
    }
  },

  async uploadFile(file: File, path: string) {
    // Ensure bucket exists, create if not
    const bucketReady = await this.createBucketIfNotExists();
    if (!bucketReady) {
      const errorMessage = `Bucket "${BUCKET_NAME}" tidak ditemukan dan tidak dapat dibuat otomatis.\n\n` +
        `Solusi:\n` +
        `1. Buka Supabase Dashboard > Storage\n` +
        `2. Klik "Create Bucket"\n` +
        `3. Nama bucket: "${BUCKET_NAME}"\n` +
        `4. Centang "Public bucket"\n` +
        `5. Atau jalankan file setup_bucket.sql di SQL Editor\n\n` +
        `Setelah membuat bucket, coba upload ulang.`;
      console.error('Bucket creation failed');
      throw new Error(errorMessage);
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // Provide more helpful error messages
      if (error.message?.includes('not found') || error.message?.includes('Bucket not found')) {
        throw new Error(
          `Bucket "${BUCKET_NAME}" tidak ditemukan.\n\n` +
          `Solusi:\n` +
          `1. Buka Supabase Dashboard > Storage\n` +
          `2. Klik "Create Bucket"\n` +
          `3. Nama bucket: "${BUCKET_NAME}"\n` +
          `4. Centang "Public bucket"\n` +
          `5. Atau jalankan SQL: INSERT INTO storage.buckets (id, name, public) VALUES ('${BUCKET_NAME}', '${BUCKET_NAME}', true);`
        );
      }
      throw error;
    }
    return data;
  },

  async getFileUrl(path: string) {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
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
    // Delete existing metadata for this archive
    const { error: deleteError } = await supabase
      .from('archive_metadata')
      .delete()
      .eq('archive_id', archiveId);

    if (deleteError) throw deleteError;

    // Only insert if there are metadata fields to insert
    if (metadata.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('archive_metadata')
      .insert(
        metadata.map(m => ({
          archive_id: archiveId,
          field_name: m.field_name,
          field_value: m.field_value || null,
          field_type: m.field_type,
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
