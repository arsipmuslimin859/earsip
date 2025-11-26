import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Group,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import { MetadataFormDynamic } from './MetadataFormDynamic';
import { useConfigStore } from '../../stores/configStore';
import { categoryService } from '../../services/categoryService';
import type { Archive, Category, MetadataField } from '../../types';

interface ArchiveFormModalProps {
  opened: boolean;
  onClose: () => void;
  archive?: Archive | null;
  onSave: (data: ArchiveFormData) => Promise<void>;
  renderAsModal?: boolean;
}

export interface ArchiveFormData {
  title: string;
  description: string;
  category_id: string;
  is_public: boolean;
  metadata: Record<string, string>;
}

export function ArchiveFormModal({ opened, onClose, archive, onSave, renderAsModal = true }: ArchiveFormModalProps) {
  const { config } = useConfigStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ArchiveFormData>({
    title: '',
    description: '',
    category_id: '',
    is_public: false,
    metadata: {},
  });

  useEffect(() => {
    if (opened) {
      loadCategories();
      if (archive) {
        // Edit mode - populate form
        setFormData({
          title: archive.title,
          description: archive.description || '',
          category_id: archive.category_id || '',
          is_public: archive.is_public,
          metadata: archive.metadata?.reduce((acc, meta) => {
            acc[meta.field_name] = meta.field_value || '';
            return acc;
          }, {} as Record<string, string>) || {},
        });
      } else {
        // Create mode - reset form
        setFormData({
          title: '',
          description: '',
          category_id: '',
          is_public: false,
          metadata: {},
        });
      }
    }
  }, [opened, archive]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const isEdit = !!archive;

  const formContent = (
    <>
      <LoadingOverlay visible={loading} />
      <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Judul"
          placeholder="Masukkan judul arsip"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />

        <Textarea
          label="Deskripsi"
          placeholder="Masukkan deskripsi arsip"
          minRows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />

        <Select
          label="Kategori"
          placeholder="Pilih kategori"
          data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
          value={formData.category_id}
          onChange={(value) => setFormData(prev => ({ ...prev, category_id: value || '' }))}
          clearable
        />

        <Checkbox
          label="Arsip Publik"
          description="Arsip dapat diakses tanpa login"
          checked={formData.is_public}
          onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.currentTarget.checked }))}
        />

        {config.metadataSchema && config.metadataSchema.length > 0 && (
          <MetadataFormDynamic
            schema={config.metadataSchema}
            values={formData.metadata}
            onChange={handleMetadataChange}
          />
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Arsip'}
          </Button>
        </Group>
      </Stack>
    </form>
    </>
  );

  if (renderAsModal) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={isEdit ? 'Edit Arsip' : 'Tambah Arsip Baru'}
        size="lg"
      >
        {formContent}
      </Modal>
    );
  }

  return formContent;
}