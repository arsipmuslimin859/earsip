import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Group,
  Table,
  ActionIcon,
  Modal,
  Text,
  ScrollArea,
  Paper,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { customTableService, CustomTable, TableRow } from '../../services/customTableService';
import { TableDataModal } from './TableDataModal';

interface TableDataTableProps {
  table: CustomTable;
  onDataChange: () => void;
}

export function TableDataTable({ table, onDataChange }: TableDataTableProps) {
  const [data, setData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TableRow | null>(null);

  const loadData = async () => {
    try {
      const tableData = await customTableService.getTableData(table.id);
      setData(tableData);
    } catch (error) {
      console.error('Error loading table data:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data tabel',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [table.id]);

  const handleAddRow = () => {
    setEditingRow(null);
    setDataModalOpen(true);
  };

  const handleEditRow = (row: TableRow) => {
    setEditingRow(row);
    setDataModalOpen(true);
  };

  const handleDeleteRow = (row: TableRow) => {
    setRowToDelete(row);
    setDeleteModalOpen(true);
  };

  const confirmDeleteRow = async () => {
    if (!rowToDelete) return;

    try {
      await customTableService.deleteRow(table.id, rowToDelete.id);
      notifications.show({
        title: 'Berhasil',
        message: 'Data berhasil dihapus',
        color: 'green',
      });
      loadData();
      onDataChange();
      setDeleteModalOpen(false);
      setRowToDelete(null);
    } catch (error) {
      console.error('Error deleting row:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus data',
        color: 'red',
      });
    }
  };

  const handleRowSaved = () => {
    loadData();
    onDataChange();
    setDataModalOpen(false);
    setEditingRow(null);
  };

  const renderCellValue = (row: TableRow, column: any) => {
    const value = row[column.id];
    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'boolean':
        return value ? 'Ya' : 'Tidak';
      case 'date':
        return new Date(value).toLocaleDateString('id-ID');
      case 'number':
        return Number(value).toLocaleString('id-ID');
      default:
        return String(value);
    }
  };

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500}>Data Tabel</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddRow}>
          Tambah Data
        </Button>
      </Group>

      <ScrollArea>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {table.columns.map((column) => (
                <Table.Th key={column.id}>
                  {column.name}
                  {column.required && <Text span c="red" ml={4}>*</Text>}
                </Table.Th>
              ))}
              <Table.Th style={{ width: 100 }}>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr key={row.id}>
                {table.columns.map((column) => (
                  <Table.Td key={column.id}>
                    {renderCellValue(row, column)}
                  </Table.Td>
                ))}
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="orange"
                      onClick={() => handleEditRow(row)}
                      title="Edit"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteRow(row)}
                      title="Hapus"
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

      {data.length === 0 && !loading && (
        <Paper p="xl" ta="center" mt="md">
          <Text c="dimmed">
            Belum ada data di tabel ini. Klik "Tambah Data" untuk menambah baris pertama.
          </Text>
        </Paper>
      )}

      <TableDataModal
        opened={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        table={table}
        row={editingRow}
        onSaved={handleRowSaved}
      />

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        centered
      >
        <Text>
          Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button color="red" onClick={confirmDeleteRow}>
            Hapus
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}