import { Grid, Paper, Text, Title, Stack, Group } from '@mantine/core';
import { IconArchive, IconFolder, IconTags, IconFileText } from '@tabler/icons-react';

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

export function DashboardPage() {
  return (
    <Stack gap="lg">
      <Title order={1}>Dashboard</Title>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Arsip"
            value={0}
            icon={<IconArchive size={32} />}
            color="#3b82f6"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Kategori"
            value={0}
            icon={<IconFolder size={32} />}
            color="#10b981"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tags"
            value={0}
            icon={<IconTags size={32} />}
            color="#f59e0b"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Arsip Publik"
            value={0}
            icon={<IconFileText size={32} />}
            color="#8b5cf6"
          />
        </Grid.Col>
      </Grid>

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
