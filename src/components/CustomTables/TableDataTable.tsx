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
  Pagination,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconExternalLink } from '@tabler/icons-react';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TableRow | null>(null);

  const loadData = async () => {
    try {
      const result = await customTableService.getTableDataPaged(table.id, {
        page,
        pageSize,
      });
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.id, page]);

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
      case 'link':
        return (
          <ActionIcon
            variant="light"
            color="blue"
            component="a"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            title={`Buka link: ${value}`}
          >
            <IconExternalLink size={16} />
          </ActionIcon>
        );
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

      {total > pageSize && (
        <Group justify="space-between" mt="md">
          <Text size="sm" c="dimmed">
            Menampilkan {(page - 1) * pageSize + 1} -{' '}
            {Math.min(page * pageSize, total)} dari {total} baris
          </Text>
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}

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