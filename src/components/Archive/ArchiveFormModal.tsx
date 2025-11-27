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
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
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
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArchiveFormData>({
    title: '',
    description: '',
    category_id: '',
    is_public: false,
    metadata: {},
  });

  useEffect(() => {
    if (opened || !renderAsModal) {
      setError(null);
      loadCategories();
      if (archive) {
        // Edit mode - populate form
        const metadataObj = archive.metadata?.reduce((acc, meta) => {
          acc[meta.field_name] = meta.field_value || '';
          return acc;
        }, {} as Record<string, string>) || {};
        
        // Initialize metadata with schema fields
        const initializedMetadata: Record<string, string> = {};
        if (config.metadataSchema && config.metadataSchema.length > 0) {
          config.metadataSchema.forEach(field => {
            initializedMetadata[field.field] = metadataObj[field.field] || '';
          });
        }
        
        setFormData({
          title: archive.title || '',
          description: archive.description || '',
          category_id: archive.category_id || '',
          is_public: archive.is_public || false,
          metadata: initializedMetadata,
        });
      } else {
        // Create mode - reset form with schema initialization
        const initializedMetadata: Record<string, string> = {};
        if (config.metadataSchema && config.metadataSchema.length > 0) {
          config.metadataSchema.forEach(field => {
            initializedMetadata[field.field] = '';
          });
        }
        
        setFormData({
          title: '',
          description: '',
          category_id: '',
          is_public: false,
          metadata: initializedMetadata,
        });
      }
    }
  }, [opened, archive, config.metadataSchema, renderAsModal]);

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
    setError(null);
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Judul arsip wajib diisi');
      return;
    }
    
    // Validate required metadata fields
    if (config.metadataSchema) {
      const missingFields: string[] = [];
      config.metadataSchema.forEach(field => {
        if (field.required && (!formData.metadata[field.field] || !formData.metadata[field.field].trim())) {
          missingFields.push(field.label);
        }
      });
      
      if (missingFields.length > 0) {
        setError(`Field wajib belum diisi: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save archive:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan arsip');
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
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            {error}
          </Alert>
        )}
        
        <TextInput
          label="Judul"
          placeholder="Masukkan judul arsip"
          required
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }));
            setError(null);
          }}
          error={error && !formData.title.trim() ? 'Judul wajib diisi' : undefined}
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
            onChange={(field, value) => {
              handleMetadataChange(field, value);
              setError(null);
            }}
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