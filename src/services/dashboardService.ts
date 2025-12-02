
export interface DashboardStats {
  totalArchives: number;
  totalCategories: number;
  totalTags: number;
  publicArchives: number;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes (1 GB for free tier)
  databaseSize: number; // estimated or actual if available
  databaseLimit: number; // 500 MB for free tier
  archivesByMonth: Array<{ month: string; count: number }>;
  archivesByCategory: Array<{ category: string; count: number }>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { supabase } = await import('../lib/supabase');
    
    // Get counts using count query (much faster than getAll)
    const [
      { count: totalArchives },
      { count: totalCategories },
      { count: totalTags },
      { count: publicArchives },
    ] = await Promise.all([
      supabase.from('archives').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true }),
      supabase.from('archives').select('*', { count: 'exact', head: true }).eq('is_public', true),
    ]);

    // Get storage used - only sum file_size, don't load all records
    const { data: storageData } = await supabase
      .from('archives')
      .select('file_size');
    
    const storageUsed = (storageData || []).reduce((sum, archive) => sum + (archive.file_size || 0), 0);
    const storageLimit = 1024 * 1024 * 1024; // 1 GB for free tier

    // Estimate database size (we can't get exact size from client, so estimate based on records)
    // Rough estimate: ~1KB per archive record + metadata
    const estimatedDbSize = (totalArchives || 0) * 1024; // Very rough estimate
    const databaseLimit = 500 * 1024 * 1024; // 500 MB for free tier

    // Get archives by month (last 6 months) - only fetch created_at
    const { data: archivesForChart } = await supabase
      .from('archives')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1000); // Limit to recent 1000 for performance

    const archivesByMonth = this.getArchivesByMonth(archivesForChart || []);

    // Get archives by category - only fetch category_id and category relation
    const { data: archivesForCategory } = await supabase
      .from('archives')
      .select('category_id, category:categories(name)')
      .limit(1000); // Limit to recent 1000 for performance

    const archivesByCategory = this.getArchivesByCategory(archivesForCategory || []);

    return {
      totalArchives: totalArchives || 0,
      totalCategories: totalCategories || 0,
      totalTags: totalTags || 0,
      publicArchives: publicArchives || 0,
      storageUsed,
      storageLimit,
      databaseSize: estimatedDbSize,
      databaseLimit,
      archivesByMonth,
      archivesByCategory,
    };
  },

  getArchivesByMonth(archives: Array<{ created_at: string }>): Array<{ month: string; count: number }> {
    const now = new Date();
    const months: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }

    // Count archives by month
    archives.forEach(archive => {
      if (archive.created_at) {
        const date = new Date(archive.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key] !== undefined) {
          months[key]++;
        }
      }
    });

    return Object.entries(months).map(([month, count]) => ({
      month: this.formatMonth(month),
      count,
    }));
  },

  getArchivesByCategory(archives: Array<{ category_id: string | null; category?: { name: string } | null }>): Array<{ category: string; count: number }> {
    const categoryCounts: { [key: string]: number } = {};

    archives.forEach(archive => {
      const categoryName = (archive.category as any)?.name || 'Tanpa Kategori';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 categories
  },

  formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  },
};

