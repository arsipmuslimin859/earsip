import { useEffect, useState } from 'react';
import { Grid, Paper, Text, Title, Stack, Group, Progress, Center, Loader, Alert } from '@mantine/core';
import {
  IconArchive,
  IconFolder,
  IconTags,
  IconFileText,
  IconDatabase,
  IconCloud,
  IconAlertCircle,
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { formatFileSize } from '../utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Stack gap="xs">
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
        </Stack>
        <div style={{ color }}>{icon}</div>
      </Group>
    </Paper>
  );
}

interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
  color: string;
  unit?: string;
}

function UsageCard({ title, used, limit, icon, color, unit = 'Bytes' }: UsageCardProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const formattedUsed = unit === 'Bytes' ? formatFileSize(used) : `${used}`;
  const formattedLimit = unit === 'Bytes' ? formatFileSize(limit) : `${limit}`;

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <div style={{ color }}>{icon}</div>
            <Text fw={600}>{title}</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {formattedUsed} / {formattedLimit}
          </Text>
        </Group>
        <Progress
          value={percentage}
          color={percentage > 80 ? 'red' : percentage > 60 ? 'yellow' : color}
          size="lg"
          radius="xl"
        />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {percentage.toFixed(1)}% digunakan
          </Text>
          {percentage > 80 && (
            <Text size="xs" c="red" fw={600}>
              Batas hampir tercapai
            </Text>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat statistik');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Stack gap="lg">
        <Title order={1}>Dashboard</Title>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Stack>
    );
  }

  if (!stats) {
    return null;
  }

  const databaseUsageRatio = stats.databaseLimit > 0 ? stats.databaseSize / stats.databaseLimit : 0;
  const isDatabaseNearLimit = databaseUsageRatio >= 0.9;

  return (
    <Stack gap="lg">
      <Title order={1}>Dashboard</Title>

      {/* Statistik Utama */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Arsip"
            value={stats.totalArchives}
            icon={<IconArchive size={32} />}
            color="#3b82f6"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Kategori"
            value={stats.totalCategories}
            icon={<IconFolder size={32} />}
            color="#10b981"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tags"
            value={stats.totalTags}
            icon={<IconTags size={32} />}
            color="#f59e0b"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Arsip Publik"
            value={stats.publicArchives}
            icon={<IconFileText size={32} />}
            color="#8b5cf6"
          />
        </Grid.Col>
      </Grid>

      {/* Informasi Penyimpanan dan Database */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <UsageCard
            title="Penyimpanan File"
            used={stats.storageUsed}
            limit={stats.storageLimit}
            icon={<IconCloud size={24} />}
            color="#3b82f6"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <UsageCard
            title="Database"
            used={stats.databaseSize}
            limit={stats.databaseLimit}
            icon={<IconDatabase size={24} />}
            color="#10b981"
          />
        </Grid.Col>
      </Grid>

      {isDatabaseNearLimit && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Database Hampir Penuh">
          Penggunaan database telah mencapai {(databaseUsageRatio * 100).toFixed(1)}% dari kuota.
          Pertimbangkan untuk menghapus data yang tidak diperlukan atau meningkatkan paket layanan.
        </Alert>
      )}

      {/* Informasi Batas Free Tier */}
      <Paper withBorder p="md" radius="md" bg="blue.0">
        <Stack gap="xs">
          <Title order={4}>Batas Free Tier</Title>
          <Text size="sm" c="dimmed">
            Batas penggunaan untuk tetap menggunakan layanan gratis:
          </Text>
          <Grid mt="xs">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm">
                <strong>Penyimpanan File:</strong> Maksimal {formatFileSize(stats.storageLimit)} (1 GB)
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm">
                <strong>Database:</strong> Maksimal {formatFileSize(stats.databaseLimit)} (500 MB)
              </Text>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>

      {/* Grafik Tren Arsip per Bulan */}
      <Paper withBorder p="md" radius="md">
        <Title order={3} mb="md">
          Tren Arsip (6 Bulan Terakhir)
        </Title>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.archivesByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Jumlah Arsip"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Grid>
        {/* Grafik Arsip per Kategori */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={3} mb="md">
              Distribusi Arsip per Kategori
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.archivesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Jumlah Arsip" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>

        {/* Pie Chart Kategori */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={3} mb="md">
              Top Kategori
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.archivesByCategory.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent = 0 }) => {
                    const category = (payload as { category?: string })?.category ?? 'Tidak diketahui';
                    return `${category}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.archivesByCategory.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Welcome Message */}
      <Paper withBorder p="md" radius="md">
        <Title order={3} mb="md">
          Selamat Datang
        </Title>
        <Text c="dimmed">
          Sistem Manajemen Arsip berbasis modular yang dapat disesuaikan dengan kebutuhan instansi Anda.
        </Text>
      </Paper>
    </Stack>
  );
}
