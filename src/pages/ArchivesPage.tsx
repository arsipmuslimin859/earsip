import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Button,
  Group,
  TextInput,
  Select,
  Loader,
  Center,
  Paper,
  Text,
  Modal,
  Tabs,
} from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { ArchiveTable } from '../components/Archive/ArchiveTable';
import { ArchiveFormModal, type ArchiveFormData } from '../components/Archive/ArchiveFormModal';
import { ArchiveUploadForm } from '../components/Archive/ArchiveUploadForm';
import { archiveService, metadataService } from '../services/archiveService';
import { categoryService } from '../services/categoryService';
import { activityLogService } from '../services/activityLogService';
import { useAuthStore } from '../stores/authStore';
import type { Archive, Category } from '../types';
import { notifications } from '@mantine/notifications';

export function ArchivesPage() {
  const { user } = useAuthStore();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modal states
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deletingArchive, setDeletingArchive] = useState<Archive | null>(null);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);

  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('upload');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [archivesData, categoriesData] = await Promise.all([
        archiveService.getAll(),
        categoryService.getAll(),
      ]);
      setArchives(archivesData);
      setCategories(categoriesData);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data arsip',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (archive: Archive) => {
    try {
      const url = await archiveService.getFileUrl(archive.file_path);
      window.open(url, '_blank');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengunduh file',
        color: 'red',
      });
    }
  };

  const handleEdit = (archive: Archive) => {
    setEditingArchive(archive);
    setEditModalOpened(true);
  };

  const handleDelete = (archive: Archive) => {
    setDeletingArchive(archive);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!deletingArchive) return;

    try {
      await archiveService.delete(deletingArchive.id);
      await archiveService.deleteFile(deletingArchive.file_path);
      
      // Log activity
      await activityLogService.create({
        action: 'delete',
        entity_type: 'archive',
        entity_id: deletingArchive.id,
        details: { title: deletingArchive.title },
      });

      setArchives(prev => prev.filter(a => a.id !== deletingArchive.id));
      notifications.show({
        title: 'Berhasil',
        message: 'Arsip berhasil dihapus',
        color: 'green',
      });
      
      setDeleteModalOpened(false);
      setDeletingArchive(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus arsip',
        color: 'red',
      });
    }
  };

  const handleAddNew = () => {
    setSelectedFile(null);
    setActiveTab('upload');
    setCreateModalOpened(true);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setActiveTab('details');
    }
  };

  const handleCreateArchive = async (formData: ArchiveFormData) => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file
      const filePath = `${Date.now()}-${selectedFile.name}`;
      await archiveService.uploadFile(selectedFile, filePath);
      setUploadProgress(50);

      // Create archive
      const archive = await archiveService.create({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || undefined,
        file_path: filePath,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        is_public: formData.is_public,
        uploaded_by: user.id,
      }) as Archive;

      // Create metadata
      if (Object.keys(formData.metadata).length > 0) {
        const metadata = Object.entries(formData.metadata).map(([field, value]) => ({
          archive_id: archive.id,
          field_name: field,
          field_value: value,
          field_type: 'text', // TODO: Get from schema
        }));
        await metadataService.create(metadata);
      }

      // Log activity
      await activityLogService.create({
        action: 'create',
        entity_type: 'archive',
        entity_id: archive.id,
        details: { title: archive.title },
      });

      setUploadProgress(100);

      // Reload archives
      await loadData();

      notifications.show({
        title: 'Berhasil',
        message: 'Arsip berhasil ditambahkan',
        color: 'green',
      });

      // Reset modal state
      setCreateModalOpened(false);
      setSelectedFile(null);
      setActiveTab('upload');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menambahkan arsip',
        color: 'red',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateArchive = async (formData: ArchiveFormData) => {
    if (!editingArchive) return;

    try {
      await archiveService.update(editingArchive.id, {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        is_public: formData.is_public,
      });

      // Update metadata
      if (Object.keys(formData.metadata).length > 0) {
        await metadataService.update(editingArchive.id, Object.entries(formData.metadata).map(([field, value]) => ({
          field_name: field,
          field_value: value,
          field_type: 'text', // TODO: Get from schema
        })));
      }

      // Log activity
      await activityLogService.create({
        action: 'update',
        entity_type: 'archive',
        entity_id: editingArchive.id,
        details: { title: formData.title },
      });

      // Reload archives
      await loadData();

      notifications.show({
        title: 'Berhasil',
        message: 'Arsip berhasil diperbarui',
        color: 'green',
      });

      setEditModalOpened(false);
      setEditingArchive(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memperbarui arsip',
        color: 'red',
      });
    }
  };

  const filteredArchives = archives.filter((archive) => {
    const matchesSearch =
      archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || archive.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} mb="xs">
              Manajemen Arsip
            </Title>
            <Text c="dimmed">
              Kelola semua arsip dalam sistem
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleAddNew}>
            Tambah Arsip Baru
          </Button>
        </Group>

        <Group grow>
          <TextInput
            placeholder="Cari arsip..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            placeholder="Semua Kategori"
            data={[
              { value: 'all', label: 'Semua Kategori' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            value={selectedCategory || 'all'}
            onChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
            clearable
          />
        </Group>

        {filteredArchives.length === 0 ? (
          <Paper p="xl" ta="center" withBorder>
            <Text c="dimmed">Tidak ada arsip yang ditemukan</Text>
          </Paper>
        ) : (
          <ArchiveTable
            archives={filteredArchives}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
            showActions={true}
          />
        )}

        {/* Create Modal */}
        <Modal
          opened={createModalOpened}
          onClose={() => {
            setCreateModalOpened(false);
            setSelectedFile(null);
            setActiveTab('upload');
          }}
          title="Tambah Arsip Baru"
          size="lg"
        >
          <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'upload')}>
            <Tabs.List>
              <Tabs.Tab value="upload">Upload File</Tabs.Tab>
              <Tabs.Tab value="details" disabled={!selectedFile}>Detail Arsip</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="upload" pt="md">
              <ArchiveUploadForm
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
            </Tabs.Panel>

            <Tabs.Panel value="details" pt="md">
              {selectedFile ? (
                <ArchiveFormModal
                  opened={false} // Don't show as modal
                  onClose={() => {
                    setCreateModalOpened(false);
                    setSelectedFile(null);
                    setActiveTab('upload');
                  }}
                  onSave={handleCreateArchive}
                  renderAsModal={false}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  Silakan upload file terlebih dahulu
                </Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Modal>

        {/* Edit Modal */}
        <ArchiveFormModal
          opened={editModalOpened}
          onClose={() => setEditModalOpened(false)}
          archive={editingArchive}
          onSave={handleUpdateArchive}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          opened={deleteModalOpened}
          onClose={() => {
            setDeleteModalOpened(false);
            setDeletingArchive(null);
          }}
          title="Konfirmasi Hapus"
          centered
        >
          <Stack gap="md">
            <Text>
              Apakah Anda yakin ingin menghapus arsip <strong>"{deletingArchive?.title}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => {
                  setDeleteModalOpened(false);
                  setDeletingArchive(null);
                }}
              >
                Batal
              </Button>
              <Button
                color="red"
                onClick={confirmDelete}
              >
                Hapus
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}