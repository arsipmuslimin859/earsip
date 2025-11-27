import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Group,
  Table,
  Text,
  Title,
  ActionIcon,
  Modal,
  TextInput,
  Stack,
  Badge,
  Paper,
  ScrollArea,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconTable, IconDatabase } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { customTableService, CustomTable } from '../services/customTableService';
import { TableDefinitionModal } from '../components/CustomTables/TableDefinitionModal';
import { TableDataTable } from '../components/CustomTables/TableDataTable';

export function CustomTablesPage() {
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [definitionModalOpen, setDefinitionModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<CustomTable | null>(null);
  const [selectedTable, setSelectedTable] = useState<CustomTable | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<CustomTable | null>(null);

  const loadTables = async () => {
    try {
      const data = await customTableService.getAll();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat struktur',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreateTable = () => {
    setEditingTable(null);
    setDefinitionModalOpen(true);
  };

  const handleEditTable = (table: CustomTable) => {
    setEditingTable(table);
    setDefinitionModalOpen(true);
  };

  const handleDeleteTable = (table: CustomTable) => {
    setTableToDelete(table);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await customTableService.delete(tableToDelete.id);
      notifications.show({
        title: 'Berhasil',
        message: `Struktur "${tableToDelete.name}" telah dihapus`,
        color: 'green',
      });
      loadTables();
      setDeleteModalOpen(false);
      setTableToDelete(null);
    } catch (error) {
      console.error('Error deleting table:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus struktur',
        color: 'red',
      });
    }
  };

  const handleTableSaved = () => {
    loadTables();
    setDefinitionModalOpen(false);
    setEditingTable(null);
  };

  const handleViewTable = (table: CustomTable) => {
    setSelectedTable(table);
  };

  const handleBackToList = () => {
    setSelectedTable(null);
  };

  if (selectedTable) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" onClick={handleBackToList}>
              ← Kembali ke Daftar Struktur
            </Button>
            <Title order={2}>{selectedTable.name}</Title>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => handleEditTable(selectedTable)}
          >
            Edit Struktur
          </Button>
        </Group>

        {selectedTable.description && (
          <Text c="dimmed">{selectedTable.description}</Text>
        )}

        <TableDataTable table={selectedTable} onDataChange={loadTables} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Struktur Arsip Dinamis</Title>
          <Text c="dimmed">Buat dan kelola struktur data dinamis untuk arsip tanpa mengubah struktur database</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateTable}>
          Buat Struktur Baru
        </Button>
      </Group>

      <Card withBorder>
        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nama Struktur</Table.Th>
                <Table.Th>Deskripsi</Table.Th>
                <Table.Th>Kolom</Table.Th>
                <Table.Th>Dibuat</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tables.map((table) => (
                <Table.Tr key={table.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconTable size={16} />
                      <Text fw={500}>{table.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{table.description || '-'}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">{table.columns.length} kolom</Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Date(table.created_at).toLocaleDateString('id-ID')}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleViewTable(table)}
                        title="Lihat Data"
                      >
                        <IconDatabase size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="orange"
                        onClick={() => handleEditTable(table)}
                        title="Edit Struktur"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteTable(table)}
                        title="Hapus Struktur"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {tables.length === 0 && !loading && (
          <Paper p="xl" ta="center">
            <IconTable size={48} stroke={1.5} style={{ color: 'var(--mantine-color-gray-4)' }} />
            <Text c="dimmed" mt="md">
              Belum ada struktur arsip dinamis. Klik "Buat Struktur Baru" untuk memulai.
            </Text>
          </Paper>
        )}
      </Card>

      <TableDefinitionModal
        opened={definitionModalOpen}
        onClose={() => setDefinitionModalOpen(false)}
        table={editingTable}
        onSaved={handleTableSaved}
      />

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        centered
      >
        <Text>
          Apakah Anda yakin ingin menghapus struktur "{tableToDelete?.name}"?
          Semua data di struktur ini akan hilang secara permanen.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button color="red" onClick={confirmDeleteTable}>
            Hapus
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}