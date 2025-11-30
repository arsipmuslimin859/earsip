import { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Card,
  Text,
  ActionIcon,
  Select,
  Checkbox,
  Divider,
} from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { customTableService, CustomTable, TableColumn } from '../../services/customTableService';

interface TableDefinitionModalProps {
  opened: boolean;
  onClose: () => void;
  table?: CustomTable | null;
  onSaved: () => void;
}

const COLUMN_TYPES = [
  { value: 'text', label: 'Teks' },
  { value: 'number', label: 'Angka' },
  { value: 'date', label: 'Tanggal' },
  { value: 'boolean', label: 'Ya/Tidak' },
  { value: 'select', label: 'Pilihan' },
  { value: 'link', label: 'Link' },
];

export function TableDefinitionModal({ opened, onClose, table, onSaved }: TableDefinitionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) {
      if (table) {
        setName(table.name);
        setDescription(table.description || '');
        setColumns(table.columns);
      } else {
        setName('');
        setDescription('');
        setColumns([]);
      }
    }
  }, [opened, table]);

  const addColumn = () => {
    const newColumn: TableColumn = {
      id: `col_${Date.now()}`,
      name: '',
      type: 'text',
      required: false,
    };
    setColumns([...columns, newColumn]);
  };

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Nama struktur harus diisi',
        color: 'red',
      });
      return;
    }

    if (columns.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Struktur harus memiliki minimal 1 kolom',
        color: 'red',
      });
      return;
    }

    // Validate columns
    for (const column of columns) {
      if (!column.name.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Semua kolom harus memiliki nama',
          color: 'red',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const tableData = {
        name: name.trim(),
        description: description.trim(),
        columns,
      };

      if (table) {
        await customTableService.update(table.id, tableData);
        notifications.show({
          title: 'Berhasil',
          message: 'Struktur berhasil diperbarui',
          color: 'green',
        });
      } else {
        await customTableService.create(tableData);
        notifications.show({
          title: 'Berhasil',
          message: 'Struktur berhasil dibuat',
          color: 'green',
        });
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving table:', error);
      const errorMessage = error?.message || error?.error?.message || 'Gagal menyimpan struktur. Pastikan migration sudah di-apply.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={table ? 'Edit Struktur' : 'Buat Struktur Baru'}
      size="lg"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="Nama Struktur"
          placeholder="Masukkan nama struktur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Deskripsi"
          placeholder="Deskripsi struktur (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={2}
        />

        <Divider label="Kolom Struktur" />

        <Stack gap="sm">
          {columns.map((column, index) => (
            <Card key={column.id} withBorder p="sm">
              <Group gap="xs" align="flex-start">
                <IconGripVertical size={16} style={{ color: 'var(--mantine-color-gray-5)' }} />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <TextInput
                      placeholder="Nama kolom"
                      value={column.name}
                      onChange={(e) => updateColumn(index, { name: e.target.value })}
                      style={{ flex: 1 }}
                      required
                    />
                    <Select
                      data={COLUMN_TYPES}
                      value={column.type}
                      onChange={(value) => updateColumn(index, { type: value as any })}
                      style={{ width: 120 }}
                    />
                  </Group>

                  {column.type === 'select' && (
                    <TextInput
                      placeholder="Pilihan (pisahkan dengan koma)"
                      value={column.options?.join(', ') || ''}
                      onChange={(e) => updateColumn(index, {
                        options: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                    />
                  )}

                  <Checkbox
                    label="Wajib diisi"
                    checked={column.required}
                    onChange={(e) => updateColumn(index, { required: e.currentTarget.checked })}
                  />
                </Stack>
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeColumn(index)}
                  disabled={columns.length === 1}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}

          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={addColumn}
            fullWidth
          >
            Tambah Kolom
          </Button>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {table ? 'Perbarui' : 'Buat'} Struktur
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}