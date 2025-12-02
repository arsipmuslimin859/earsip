import { useState, useEffect, useCallback } from 'react';
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
  Pagination,
  Skeleton,
  Card,
  Badge,
} from '@mantine/core';
import { IconSearch, IconArchive } from '@tabler/icons-react';
import { ArchiveCard } from '../components/Archive/ArchiveCard';
import { archiveService } from '../services/archiveService';
import { categoryService } from '../services/categoryService';
import type { Archive, Category } from '../types';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';

export function PublicArchivePage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArchives, setTotalArchives] = useState(0);

  const itemsPerPage = 12; // Optimized for performance

  // Debounced search
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset to page 1 when search/filter changes
    setCurrentPage(1);
    loadArchives(1, debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory]);

  const loadData = async () => {
    try {
      // Load categories (cached)
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);

      // Load initial archives
      await loadArchives(1, '', null);
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

  const loadArchives = async (page: number, search: string, category: string | null) => {
    try {
      const result = await archiveService.getPaged({
        page,
        pageSize: itemsPerPage,
        isPublicOnly: true,
        search: search || undefined,
        categoryId: category || undefined,
      });

      setArchives(result.data);
      setTotalArchives(result.total);
      setTotalPages(Math.ceil(result.total / itemsPerPage));
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat arsip',
        color: 'red',
      });
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    loadArchives(page, debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory]);

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
        <Paper p="xl" radius="md" withBorder style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={1} mb="xs">
                Dokumen Arsip
              </Title>
              <Text style={{ opacity: 0.9 }}>
                Jelajahi dan unduh dokumen arsip yang tersedia untuk umum
              </Text>
            </div>
            <Badge size="lg" variant="light" color="white" style={{ color: '#667eea' }}>
              {totalArchives} dokumen total
            </Badge>
          </Group>
        </Paper>

        <Group grow>
          <TextInput
            placeholder="Cari arsip..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            rightSection={debouncedSearch !== searchQuery ? <Loader size="xs" /> : null}
          />
          <Select
            placeholder="Semua Kategori"
            data={[
              { value: '', label: 'Semua Kategori' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            value={selectedCategory}
            onChange={setSelectedCategory}
            clearable
          />
        </Group>

        {loading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Skeleton height={20} width="80%" />
                  <Skeleton height={16} width="60%" />
                  <Group justify="space-between">
                    <Skeleton height={24} width={60} />
                    <Skeleton height={24} width={80} />
                  </Group>
                  <Skeleton height={32} width="100%" />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : archives.length === 0 ? (
          <Paper p="xl" ta="center" withBorder>
            <Stack align="center" gap="md">
              <IconArchive size={48} style={{ color: 'var(--mantine-color-gray-4)' }} />
              <div>
                <Text size="lg" fw={500}>Tidak ada arsip ditemukan</Text>
                <Text c="dimmed">
                  {searchQuery || selectedCategory ? 'Coba ubah kriteria pencarian' : 'Belum ada arsip publik'}
                </Text>
              </div>
            </Stack>
          </Paper>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {archives.map((archive) => (
                <ArchiveCard
                  key={archive.id}
                  archive={archive}
                  onDownload={handleDownload}
                  showActions={true}
                />
              ))}
            </SimpleGrid>

            {totalPages > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={currentPage}
                  onChange={handlePageChange}
                  total={totalPages}
                  size="lg"
                />
              </Group>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
