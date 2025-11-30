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
  Pagination,
} from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { ArchiveTable } from '../components/Archive/ArchiveTable';
import { ArchiveFormModal, type ArchiveFormData } from '../components/Archive/ArchiveFormModal';
import { ArchiveUploadForm } from '../components/Archive/ArchiveUploadForm';
import { archiveService, metadataService } from '../services/archiveService';
import { categoryService } from '../services/categoryService';
import { activityLogService } from '../services/activityLogService';
import { useAuthStore } from '../stores/authStore';
import { useConfigStore } from '../stores/configStore';
import type { Archive, Category } from '../types';
import { notifications } from '@mantine/notifications';

export function ArchivesPage() {
  const { user } = useAuthStore();
  const { config } = useConfigStore();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

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
  const [storageOption, setStorageOption] = useState<'local' | 'drive'>('local');
  const [externalLink, setExternalLink] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      const [archivesResult, categoriesData] = await Promise.all([
        archiveService.getPaged({
          page,
          pageSize,
          search: searchQuery,
          categoryId: selectedCategory,
        }),
        categoryService.getAll(),
      ]);

      setArchives(archivesResult.data);
      setTotal(archivesResult.total);
      setTotalPages(Math.max(1, Math.ceil(archivesResult.total / pageSize)));
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
      if (archive.external_url) {
        window.open(archive.external_url, '_blank', 'noopener');
        return;
      }

      if (!archive.file_path) {
        notifications.show({
          title: 'Error',
          message: 'File tidak tersedia untuk arsip ini',
          color: 'red',
        });
        return;
      }

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

  const handleEdit = async (archive: Archive) => {
    try {
      // Fetch full archive details with metadata
      const fullArchive = await archiveService.getById(archive.id);
      if (fullArchive) {
        setEditingArchive(fullArchive);
        setEditModalOpened(true);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat detail arsip',
        color: 'red',
      });
    }
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
    setStorageOption('local');
    setExternalLink('');
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
    if (!user) {
      notifications.show({
        title: 'Error',
        message: 'User tidak ditemukan. Silakan refresh halaman dan coba lagi.',
        color: 'red',
      });
      return;
    }

    const useDrive = storageOption === 'drive';

    if (!useDrive && !selectedFile) {
      notifications.show({
        title: 'Error',
        message: 'File atau user tidak ditemukan. Silakan refresh halaman dan coba lagi.',
        color: 'red',
      });
      return;
    }

    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      notifications.show({
        title: 'Validasi',
        message: 'Judul arsip wajib diisi',
        color: 'orange',
      });
      return;
    }

    if (useDrive && (!externalLink || externalLink.trim() === '')) {
      notifications.show({
        title: 'Validasi',
        message: 'Link Drive wajib diisi saat memilih opsi penyimpanan Drive',
        color: 'orange',
      });
      return;
    }

    if (!useDrive) {
      setUploading(true);
      setUploadProgress(0);
    }

    try {
      let filePath: string | null = null;
      let fileName = formData.title.trim();
      let fileSize = 0;
      let fileType: string | null = null;

      if (!useDrive && selectedFile) {
        filePath = `${Date.now()}-${selectedFile.name}`;
        await archiveService.uploadFile(selectedFile, filePath);
        setUploadProgress(50);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        fileType = selectedFile.type || null;
      }

      // Create archive record with proper null handling
      const archive = await archiveService.create({
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category_id: formData.category_id && formData.category_id !== '' ? formData.category_id : null,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        external_url: useDrive ? externalLink.trim() : null,
        is_public: formData.is_public || false,
        uploaded_by: user.id,
      }) as Archive;

      // Create metadata if exists
      if (formData.metadata && Object.keys(formData.metadata).length > 0) {
        const metadataFields = Object.entries(formData.metadata)
          .filter(([_, value]) => value && value.toString().trim() !== '')
          .map(([field, value]) => {
            const schemaField = config.metadataSchema?.find(s => s.field === field);
            return {
              archive_id: archive.id,
              field_name: field,
              field_value: value.toString().trim(),
              field_type: schemaField?.type || 'text',
            };
          });
        
        if (metadataFields.length > 0) {
          await metadataService.create(metadataFields);
        }
      }

      // Log activity
      await activityLogService.create({
        action: 'create',
        entity_type: 'archive',
        entity_id: archive.id,
        details: { title: archive.title },
      });

      if (!useDrive) {
        setUploadProgress(100);
      }

      // Reload archives to get fresh data with relations
      await loadData();

      notifications.show({
        title: 'Berhasil',
        message: 'Arsip berhasil ditambahkan',
        color: 'green',
      });

      // Reset modal state
      setCreateModalOpened(false);
      setSelectedFile(null);
      setStorageOption('local');
      setExternalLink('');
      setActiveTab('upload');
    } catch (error) {
      console.error('Error creating archive:', error);
      let errorMessage = 'Terjadi kesalahan saat menyimpan arsip';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // If it's a bucket error, show it longer and with better formatting
        if (error.message.includes('Bucket') || error.message.includes('bucket')) {
          notifications.show({
            title: '❌ Bucket Tidak Ditemukan',
            message: errorMessage,
            color: 'red',
            autoClose: 10000, // Show longer for bucket errors
          });
          return;
        }
      }
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateArchive = async (formData: ArchiveFormData) => {
    if (!editingArchive) {
      notifications.show({
        title: 'Error',
        message: 'Arsip yang akan diedit tidak ditemukan',
        color: 'red',
      });
      return;
    }

    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      notifications.show({
        title: 'Validasi',
        message: 'Judul arsip wajib diisi',
        color: 'orange',
      });
      return;
    }

    try {
      const useDrive = formData.storageOption === 'drive';
      const externalLink = formData.externalLink?.trim() || null;

      // Update archive with proper null handling
      await archiveService.update(editingArchive.id, {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category_id: formData.category_id && formData.category_id !== '' ? formData.category_id : null,
        is_public: formData.is_public || false,
        external_url: useDrive ? externalLink : null,
        file_path: useDrive ? null : editingArchive.file_path,
        file_size: useDrive ? 0 : editingArchive.file_size,
        file_type: useDrive ? null : editingArchive.file_type,
      });

      // Update metadata - always update, even if empty (to clear removed fields)
      const metadataFields = formData.metadata 
        ? Object.entries(formData.metadata)
            .filter(([_, value]) => value && value.toString().trim() !== '')
            .map(([field, value]) => {
              const schemaField = config.metadataSchema?.find(s => s.field === field);
              return {
                field_name: field,
                field_value: value.toString().trim(),
                field_type: schemaField?.type || 'text',
              };
            })
        : [];
      
      await metadataService.update(editingArchive.id, metadataFields);

      // Log activity
      await activityLogService.create({
        action: 'update',
        entity_type: 'archive',
        entity_id: editingArchive.id,
        details: { title: formData.title },
      });

      // Reload archives to get fresh data with relations
      await loadData();

      notifications.show({
        title: 'Berhasil',
        message: 'Arsip berhasil diperbarui',
        color: 'green',
      });

      setEditModalOpened(false);
      setEditingArchive(null);
    } catch (error) {
      console.error('Error updating archive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui arsip';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

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
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            clearable
          />
        </Group>

        {archives.length === 0 ? (
          <Paper p="xl" ta="center" withBorder>
            <Text c="dimmed">Tidak ada arsip yang ditemukan</Text>
          </Paper>
        ) : (
          <ArchiveTable
            archives={archives}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
            showActions={true}
          />
        )}

        {total > pageSize && (
          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              Menampilkan {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, total)} dari {total} arsip
            </Text>
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}

        {/* Create Modal */}
        <Modal
          opened={createModalOpened}
          onClose={() => {
            setCreateModalOpened(false);
            setSelectedFile(null);
            setStorageOption('local');
            setExternalLink('');
            setActiveTab('upload');
          }}
          title="Tambah Arsip Baru"
          size="lg"
        >
          <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'upload')}>
            <Tabs.List>
              <Tabs.Tab value="upload">Upload File</Tabs.Tab>
              <Tabs.Tab value="details">Detail Arsip</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="upload" pt="md">
              <ArchiveUploadForm
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                uploading={uploading}
                uploadProgress={uploadProgress}
                storageOption={storageOption}
                onStorageOptionChange={setStorageOption}
                externalLink={externalLink}
                onExternalLinkChange={setExternalLink}
              />
            </Tabs.Panel>

            <Tabs.Panel value="details" pt="md">
              {(selectedFile || storageOption === 'drive') ? (
                <ArchiveFormModal
                  opened={true} // Keep opened true so form initializes
                  onClose={() => {
                    // This will be handled by the modal's onClose
                    setCreateModalOpened(false);
                    setSelectedFile(null);
                    setStorageOption('local');
                    setExternalLink('');
                    setActiveTab('upload');
                  }}
                  onSave={async (formData) => {
                    // Override formData with current storage option and external link
                    const updatedFormData = {
                      ...formData,
                      storageOption,
                      externalLink,
                    };
                    await handleCreateArchive(updatedFormData);
                    // Reset after successful save
                    setSelectedFile(null);
                    setStorageOption('local');
                    setExternalLink('');
                    setActiveTab('upload');
                  }}
                  hasUploadedFile={Boolean(selectedFile)}
                  renderAsModal={false}
                  initialStorageOption={storageOption}
                  initialExternalLink={externalLink}
                />
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  Silakan upload file atau pilih Link Drive terlebih dahulu
                </Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Modal>

        {/* Edit Modal */}
        <ArchiveFormModal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setEditingArchive(null);
          }}
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