import { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Checkbox,
  Select,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { customTableService, CustomTable, TableRow } from '../../services/customTableService';

interface TableDataModalProps {
  opened: boolean;
  onClose: () => void;
  table: CustomTable;
  row?: TableRow | null;
  onSaved: () => void;
}

export function TableDataModal({ opened, onClose, table, row, onSaved }: TableDataModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) {
      if (row) {
        setFormData({ ...row });
      } else {
        // Initialize empty form
        const initialData: Record<string, any> = {};
        table.columns.forEach(column => {
          initialData[column.id] = column.type === 'boolean' ? false : '';
        });
        setFormData(initialData);
      }
    }
  }, [opened, row, table.columns]);

  const handleFieldChange = (columnId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const validateForm = () => {
    for (const column of table.columns) {
      const value = formData[column.id];

      if (column.required) {
        if (value === '' || value === null || value === undefined) {
          notifications.show({
            title: 'Error',
            message: `Field "${column.name}" harus diisi`,
            color: 'red',
          });
          return false;
        }
      }

      // Type validation
      if (value !== '' && value !== null && value !== undefined) {
        switch (column.type) {
          case 'number':
            if (isNaN(Number(value))) {
              notifications.show({
                title: 'Error',
                message: `Field "${column.name}" harus berupa angka`,
                color: 'red',
              });
              return false;
            }
            break;
          case 'date':
            if (!(value instanceof Date) && isNaN(Date.parse(value))) {
              notifications.show({
                title: 'Error',
                message: `Field "${column.name}" harus berupa tanggal yang valid`,
                color: 'red',
              });
              return false;
            }
            break;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Prepare data for saving
      const dataToSave: Record<string, any> = {};
      table.columns.forEach(column => {
        let value = formData[column.id];

        // Convert types
        if (column.type === 'number' && value !== '') {
          value = Number(value);
        } else if (column.type === 'date' && value) {
          value = value instanceof Date ? value.toISOString() : new Date(value).toISOString();
        } else if (column.type === 'boolean') {
          value = Boolean(value);
        }

        dataToSave[column.id] = value;
      });

      if (row) {
        await customTableService.updateRow(table.id, row.id, dataToSave);
        notifications.show({
          title: 'Berhasil',
          message: 'Data berhasil diperbarui',
          color: 'green',
        });
      } else {
        await customTableService.addRow(table.id, dataToSave);
        notifications.show({
          title: 'Berhasil',
          message: 'Data berhasil ditambahkan',
          color: 'green',
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving data:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan data',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (column: any) => {
    const value = formData[column.id];
    const isRequired = column.required;

    switch (column.type) {
      case 'text':
        return (
          <TextInput
            label={column.name}
            placeholder={`Masukkan ${column.name.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            required={isRequired}
          />
        );

      case 'number':
        return (
          <NumberInput
            label={column.name}
            placeholder={`Masukkan ${column.name.toLowerCase()}`}
            value={value || ''}
            onChange={(val) => handleFieldChange(column.id, val)}
            required={isRequired}
          />
        );

      case 'date':
        return (
          <DateInput
            label={column.name}
            placeholder={`Pilih ${column.name.toLowerCase()}`}
            value={value ? new Date(value) : null}
            onChange={(date) => handleFieldChange(column.id, date)}
            required={isRequired}
          />
        );

      case 'boolean':
        return (
          <Checkbox
            label={column.name}
            checked={Boolean(value)}
            onChange={(e) => handleFieldChange(column.id, e.currentTarget.checked)}
          />
        );

      case 'select':
        const options = column.options?.map((option: string) => ({
          value: option,
          label: option,
        })) || [];

        return (
          <Select
            label={column.name}
            placeholder={`Pilih ${column.name.toLowerCase()}`}
            data={options}
            value={value || null}
            onChange={(val) => handleFieldChange(column.id, val)}
            required={isRequired}
            searchable
          />
        );

      default:
        return (
          <TextInput
            label={column.name}
            placeholder={`Masukkan ${column.name.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            required={isRequired}
          />
        );
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={row ? 'Edit Data' : 'Tambah Data Baru'}
      size="md"
      centered
    >
      <Stack gap="md">
        {table.columns.map((column) => (
          <div key={column.id}>
            {renderField(column)}
          </div>
        ))}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {row ? 'Perbarui' : 'Simpan'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}