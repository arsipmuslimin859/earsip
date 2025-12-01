import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  TextInput,
  Group,
  Select,
  SimpleGrid,
  Loader,
  Center,
  Paper,
  Card,
  Badge,
  Table,
  ScrollArea,
  Skeleton,
} from '@mantine/core';
import { IconSearch, IconTable, IconDatabase } from '@tabler/icons-react';
import { customTableService, CustomTable } from '../services/customTableService';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';

export function PublicCustomTablesPage() {
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<CustomTable | null>(null);

  // Debounced search
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      // Get all tables and filter public ones
      const allTables = await customTableService.getAll();
      const publicTables = allTables.filter(table => table.is_public);
      setTables(publicTables);
    } catch (error) {
      console.error('Error loading tables:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data struktur publik',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTable = async (table: CustomTable) => {
    setSelectedTable(table);
  };

  const handleBackToList = () => {
    setSelectedTable(null);
  };

  // Memoized filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch =
        table.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (table.description && table.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchesSearch;
    });
  }, [tables, debouncedSearch]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (selectedTable) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Title order={1} mb="xs">{selectedTable.name}</Title>
                {selectedTable.description && (
                  <Text c="dimmed">{selectedTable.description}</Text>
                )}
              </div>
              <Group>
                <Badge color="green" variant="light">Publik</Badge>
                <Text size="sm" c="dimmed">
                  {selectedTable.columns.length} kolom
                </Text>
              </Group>
            </Group>
          </Paper>

          <Group justify="flex-start">
            <Text
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              c="blue"
              onClick={handleBackToList}
            >
              ← Kembali ke Daftar Struktur
            </Text>
          </Group>

          <Card withBorder>
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    {selectedTable.columns.map((column) => (
                      <Table.Th key={column.id}>
                        {column.name}
                        {column.required && <Text span c="red" ml={4}>*</Text>}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td colSpan={selectedTable.columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text c="dimmed">Data tidak dapat ditampilkan di halaman publik</Text>
                      <Text size="sm" c="dimmed" mt="xs">
                        Silakan login untuk melihat data struktur ini
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Paper p="xl" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <Title order={1} mb="xs">
            Data Publik
          </Title>
          <Text style={{ opacity: 0.9 }}>
            Jelajahi struktur data publik yang tersedia untuk umum
          </Text>
        </Paper>

        <Group grow>
          <TextInput
            placeholder="Cari struktur..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            rightSection={debouncedSearch !== searchQuery ? <Loader size="xs" /> : null}
          />
        </Group>

        {loading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={24} width="50px" />
                  </Group>
                  <Skeleton height={16} width="80%" />
                  <Skeleton height={16} width="40%" />
                  <Group justify="space-between">
                    <Skeleton height={14} width="40px" />
                    <Skeleton height={14} width="80px" />
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : filteredTables.length === 0 ? (
          <Paper p="xl" ta="center" withBorder>
            <Stack align="center" gap="md">
              <IconDatabase size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
              <div>
                <Text size="lg" fw={500}>Tidak ada struktur ditemukan</Text>
                <Text c="dimmed">
                  {searchQuery ? 'Coba ubah kriteria pencarian' : 'Belum ada struktur publik'}
                </Text>
              </div>
            </Stack>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
            {filteredTables.map((table) => (
              <Card
                key={table.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onClick={() => handleViewTable(table)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Group>
                    <IconTable size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    <Text fw={500} size="lg">
                      {table.name}
                    </Text>
                  </Group>
                  <Badge color="green" variant="light">Publik</Badge>
                </Group>

                {table.description && (
                  <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                    {table.description}
                  </Text>
                )}

                <Group justify="space-between" mt="md">
                  <Text size="xs" c="dimmed">
                    {table.columns.length} kolom
                  </Text>
                  <Text size="xs" c="dimmed">
                    Dibuat {new Date(table.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}