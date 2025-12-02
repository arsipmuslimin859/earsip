import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Code,
  Container,
  Group,
  Loader,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconDownload, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { activityLogService } from '../services/activityLogService';
import type { ActivityLog } from '../types';

type Filters = {
  action: string;
  userId: string;
  entityType: string;
  dateRange: [Date | null, Date | null];
  limit: number;
};

const defaultFilters: Filters = {
  action: '',
  userId: '',
  entityType: '',
  dateRange: [null, null],
  limit: 100,
};

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await activityLogService.getPaginated({
        page,
        pageSize: filters.limit,
        action: filters.action || undefined,
        userId: filters.userId || undefined,
        entityType: filters.entityType || undefined,
        dateFrom: filters.dateRange[0]?.toISOString(),
        dateTo: filters.dateRange[1]?.toISOString(),
      });
      setLogs(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat activity log',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (logs.length === 0) {
      notifications.show({
        title: 'Tidak ada data',
        message: 'Tidak ada log untuk diekspor',
        color: 'orange',
      });
      return;
    }

    const header = ['Tanggal', 'Pengguna', 'Aksi', 'Entity', 'Entity ID', 'Detail'];
    const rows = logs.map((log) => [
      new Date(log.created_at).toISOString(),
      log.user_id || '-',
      log.action,
      log.entity_type,
      log.entity_id || '-',
      JSON.stringify(log.details || {}),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.action)));
  }, [logs]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" justify="center" h="50vh">
          <Loader size="lg" />
          <Text c="dimmed">Memuat activity log...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Activity Log</Title>
            <Text c="dimmed">Pantau setiap aksi pengguna dalam sistem</Text>
          </div>
          <Group>
            <Button variant="light" leftSection={<IconRefresh size={16} />} loading={refreshing} onClick={handleRefresh}>
              Muat ulang
            </Button>
            <Button leftSection={<IconDownload size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
          </Group>
        </Group>

        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="Action"
                placeholder="Cari action..."
                value={filters.action}
                onChange={(event) => setFilters((prev) => ({ ...prev, action: event.currentTarget.value }))}
                list="actions-list"
              />
              <TextInput
                label="User ID"
                placeholder="Masukkan user id"
                value={filters.userId}
                onChange={(event) => setFilters((prev) => ({ ...prev, userId: event.currentTarget.value }))}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Entity Type"
                placeholder="Contoh: archives"
                value={filters.entityType}
                onChange={(event) => setFilters((prev) => ({ ...prev, entityType: event.currentTarget.value }))}
              />
              <DatePickerInput
                type="range"
                label="Rentang Tanggal"
                placeholder="Pilih tanggal"
                value={filters.dateRange}
                onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
              />
              <TextInput
                label="Jumlah per halaman"
                type="number"
                min={10}
                max={500}
                value={String(filters.limit)}
                onChange={(event) => {
                  const value = Number(event.currentTarget.value) || defaultFilters.limit;
                  setFilters((prev) => ({ ...prev, limit: value }));
                  setPage(1);
                }}
              />
            </Group>
            <Group justify="flex-end">
              <Button variant="default" onClick={resetFilters}>
                Reset
              </Button>
              <Button
                onClick={() => {
                  setPage(1);
                  loadLogs();
                }}
              >
                Terapkan Filter
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder radius="md">
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tanggal</Table.Th>
                  <Table.Th>Pengguna</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                  <Table.Th>Entity</Table.Th>
                  <Table.Th>Detail</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center">
                        Tidak ada log ditemukan
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  logs.map((log) => (
                    <Table.Tr key={log.id}>
                      <Table.Td>
                        <Text fw={500}>{new Date(log.created_at).toLocaleString('id-ID')}</Text>
                      </Table.Td>
                      <Table.Td>
                        {log.user_id ? (
                          <Badge variant="light">{log.user_id}</Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Sistem
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text fw={600}>{log.action}</Text>
                          <Text size="xs" c="dimmed">
                            {log.entity_id ?? 'Tanpa ID'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{log.entity_type}</Text>
                      </Table.Td>
                      <Table.Td>
                        <ScrollArea h={100}>
                          <Code block>
                            {JSON.stringify(log.details ?? {}, null, 2)}
                          </Code>
                        </ScrollArea>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>

        {total > filters.limit && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Menampilkan {(page - 1) * filters.limit + 1} -{' '}
              {Math.min(page * filters.limit, total)} dari {total} log
            </Text>
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}
      </Stack>

      <datalist id="actions-list">
        {uniqueActions.map((action) => (
          <option key={action} value={action} />
        ))}
      </datalist>
    </Container>
  );
}

