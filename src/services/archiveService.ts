import { supabase } from '../lib/supabase';
import type { Archive, ArchiveMetadata } from '../types';
import institutionConfig from '../config/institution.config.json';

// Get bucket name from config
const BUCKET_NAME = institutionConfig.storage.bucketName || 'archives';

export interface ArchivePageResult {
  data: Archive[];
  total: number;
}

export const archiveService = {
  /**
   * Legacy helper – fetch all archives (hindari untuk dataset besar).
   * Sebisa mungkin gunakan getPaged untuk performa yang lebih baik.
   */
  async getAll(isPublicOnly = false) {
    let query = supabase
      .from('archives')
      .select(
        `
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `
      )
      .order('created_at', { ascending: false });

    if (isPublicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Archive[];
  },

  /**
   * Server-side pagination untuk arsip.
   * Mengembalikan data + total count untuk kebutuhan Pagination di UI.
   */
  async getPaged(options: {
    page: number;
    pageSize: number;
    isPublicOnly?: boolean;
    search?: string;
    categoryId?: string | null;
  }): Promise<ArchivePageResult> {
    const { page, pageSize, isPublicOnly, search, categoryId } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('archives')
      .select(
        `
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (isPublicOnly) {
      query = query.eq('is_public', true);
    }

    if (search && search.trim() !== '') {
      query = query.or(
        `title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
      );
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data || []) as Archive[],
      total: count ?? 0,
    };
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
    description?: string | null;
    category_id?: string | null;
    file_path?: string | null;
    file_name: string;
    file_size: number;
    file_type: string | null;
    external_url?: string | null;
    is_public: boolean;
    uploaded_by: string;
  }) {
    const { data, error } = await supabase
      .from('archives')
      .insert(archive)
      .select(`
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `)
      .single();

    if (error) throw error;
    return data as Archive;
  },

  async update(id: string, updates: Partial<Archive>) {
    // Ensure updated_at is set
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('archives')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `)
      .single();

    if (error) throw error;
    return data as Archive;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('archives')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadFile(file: File, path: string) {
    console.log(`📤 Starting upload of "${file.name}" to bucket "${BUCKET_NAME}"...`);

    // First, verify bucket status for better error messages
    const bucketStatus = await this.verifyBucketStatus();

    if (!bucketStatus.exists) {
      const sqlCommand = `INSERT INTO storage.buckets (id, name, public) VALUES ('${BUCKET_NAME}', '${BUCKET_NAME}', true) ON CONFLICT (id) DO NOTHING;`;

      throw new Error(
        `❌ Bucket "${BUCKET_NAME}" tidak ditemukan!\n\n` +
        `📋 CARA MEMBUAT BUCKET:\n\n` +
        `Cara 1 - Via Dashboard (Paling Mudah):\n` +
        `1. Buka Supabase Dashboard → Storage\n` +
        `2. Klik "New bucket" atau "Create bucket"\n` +
        `3. Nama: "${BUCKET_NAME}" (harus tepat!)\n` +
        `4. ✅ Centang "Public bucket" (WAJIB!)\n` +
        `5. Klik "Create bucket"\n\n` +
        `Cara 2 - Via SQL Editor:\n` +
        `1. Buka Supabase Dashboard → SQL Editor\n` +
        `2. Copy paste SQL berikut:\n\n` +
        `${sqlCommand}\n\n` +
        `3. Klik "Run"\n\n` +
        `✅ Setelah membuat bucket, refresh halaman dan coba upload lagi.`
      );
    }

    if (!bucketStatus.isPublic) {
      throw new Error(
        `❌ Bucket "${BUCKET_NAME}" tidak bersifat PUBLIC!\n\n` +
        `📋 SOLUSI:\n\n` +
        `1. Buka Supabase Dashboard → Storage\n` +
        `2. Klik bucket "${BUCKET_NAME}"\n` +
        `3. Pastikan "Public bucket" dicentang\n` +
        `4. Jika tidak, edit bucket dan centang "Public bucket"`
      );
    }

    // Direct upload attempt
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload error:', error);

      // Handle permission errors
      if (
        error.message?.toLowerCase().includes('permission') ||
        error.message?.toLowerCase().includes('unauthorized') ||
        error.message?.toLowerCase().includes('forbidden')
      ) {
        throw new Error(
          `❌ Tidak memiliki permission untuk upload ke bucket "${BUCKET_NAME}"\n\n` +
          `📋 SOLUSI:\n\n` +
          `1. Pastikan bucket "${BUCKET_NAME}" sudah dibuat dan PUBLIC\n` +
          `2. Pastikan Storage Policies sudah dibuat\n` +
          `3. Jalankan SQL berikut di SQL Editor:\n\n` +
          `INSERT INTO storage.policies (name, definition) VALUES\n` +
          `('Allow public read', 'bucket_id = ''${BUCKET_NAME}'''),\n` +
          `('Allow authenticated upload', 'bucket_id = ''${BUCKET_NAME}'' AND auth.role() = ''authenticated''');\n\n` +
          `4. Hubungi administrator untuk memeriksa RLS policies`
        );
      }

      // Generic error
      throw new Error(
        `❌ Gagal mengupload file: ${error.message || 'Unknown error'}\n\n` +
        `📋 CEKLIST:\n` +
        `✅ Bucket "${BUCKET_NAME}" sudah dibuat\n` +
        `✅ Bucket bersifat PUBLIC\n` +
        `✅ File size (${(file.size / 1024 / 1024).toFixed(2)} MB) tidak melebihi limit\n` +
        `✅ Format file (${file.type}) didukung\n` +
        `✅ User sudah login`
      );
    }

    console.log('✅ File uploaded successfully:', data);
    return data;
  },

  async getFileUrl(path: string | null) {
    if (!path) {
      throw new Error('File path tidak tersedia untuk arsip ini');
    }
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Debug bucket status - call this manually to check bucket configuration
   */
  async debugBucketStatus(): Promise<string> {
    const status = await this.verifyBucketStatus();

    let report = `🔍 Bucket "${BUCKET_NAME}" Status Report:\n\n`;

    if (status.exists) {
      report += `✅ Bucket exists\n`;
      report += `📢 Public access: ${status.isPublic ? '✅ Yes' : '❌ No'}\n`;
      report += `🔐 Write permissions: ${status.hasPolicies ? '✅ OK' : '❌ Failed'}\n`;

      if (status.details) {
        report += `\n📋 Details: ${status.details}\n`;
      }

      if (!status.isPublic) {
        report += `\n⚠️  WARNING: Bucket is not public! Files cannot be accessed.\n`;
        report += `   Fix: Go to Supabase Dashboard → Storage → Edit bucket → Check "Public bucket"\n`;
      }

      if (!status.hasPolicies) {
        report += `\n⚠️  WARNING: Upload permissions failed!\n`;
        report += `   This might be normal if you just created the bucket.\n`;
        report += `   Try uploading a file to test.\n`;
      }
    } else {
      report += `❌ Bucket does not exist\n`;
      if (status.error) {
        report += `   Error: ${status.error}\n`;
      }
      if (status.details) {
        report += `   Details: ${status.details}\n`;
      }

      report += `\n📋 To create bucket:\n`;
      report += `   1. Go to Supabase Dashboard → Storage\n`;
      report += `   2. Click "Create bucket"\n`;
      report += `   3. Name: "${BUCKET_NAME}"\n`;
      report += `   4. Check "Public bucket"\n`;
    }

    console.log(report);
    return report;
  },

  /**
   * Verify bucket status and provide detailed diagnostics
   */
  async verifyBucketStatus(): Promise<{
    exists: boolean;
    isPublic: boolean;
    hasPolicies: boolean;
    error?: string;
    details?: string;
  }> {
    try {
      console.log(`🔍 Verifying bucket "${BUCKET_NAME}" status...`);

      // 1. Check if bucket exists by listing files
      const { error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });

      if (listError) {
        console.error('❌ Bucket list error:', listError);
        if (
          listError.message?.toLowerCase().includes('not found') ||
          listError.message?.toLowerCase().includes('bucket not found') ||
          listError.message?.toLowerCase().includes('does not exist')
        ) {
          return {
            exists: false,
            isPublic: false,
            hasPolicies: false,
            error: 'Bucket tidak ditemukan',
            details: `Bucket "${BUCKET_NAME}" belum dibuat di Supabase Storage`
          };
        }
        return {
          exists: false,
          isPublic: false,
          hasPolicies: false,
          error: listError.message,
          details: 'Error saat memeriksa bucket'
        };
      }

      console.log('✅ Bucket exists, checking public access...');

      // 2. Check if bucket is public by trying to get a public URL
      const testPath = 'test-file.txt';
      const { data: publicUrl } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(testPath);

      // If we get a public URL, bucket is likely public
      const isPublic = !!(publicUrl && publicUrl.publicUrl && publicUrl.publicUrl.includes(BUCKET_NAME));
      console.log(`📢 Bucket public status: ${isPublic ? '✅ Public' : '❌ Private'}`);

      // 3. Try a small upload to test write permissions
      console.log('🧪 Testing upload permissions...');
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`test-${Date.now()}.txt`, testFile, { upsert: true });

      const hasWriteAccess = !uploadError;
      console.log(`✏️  Write access: ${hasWriteAccess ? '✅ OK' : '❌ Failed'}`);

      // Clean up test file if upload succeeded
      if (hasWriteAccess) {
        await supabase.storage.from(BUCKET_NAME).remove([`test-${Date.now()}.txt`]);
      }

      return {
        exists: true,
        isPublic,
        hasPolicies: hasWriteAccess, // Simplified check
        details: `Bucket status: ${isPublic ? 'Public' : 'Private'}, Write access: ${hasWriteAccess ? 'OK' : 'Failed'}`
      };

    } catch (error) {
      console.error('💥 Bucket verification error:', error);
      return {
        exists: false,
        isPublic: false,
        hasPolicies: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Error saat verifikasi bucket'
      };
    }
  },

  async deleteFile(path: string | null) {
    if (!path) {
      return;
    }
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
  },

  async getPaginated(options: {
    page: number;
    pageSize: number;
    isPublicOnly?: boolean;
    categoryId?: string;
    searchQuery?: string;
  }) {
    const { page, pageSize, isPublicOnly, categoryId, searchQuery } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('archives')
      .select(`
        *,
        category:categories(*),
        tags:archive_tags(tag:tags(*)),
        metadata:archive_metadata(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (isPublicOnly) {
      query = query.eq('is_public', true);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as Archive[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
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
