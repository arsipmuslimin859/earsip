import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  TextInput,
  Group,
  Select,
  Grid,
  Loader,
  Center,
  Paper,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { ArchiveCard } from '../components/Archive/ArchiveCard';
import { archiveService } from '../services/archiveService';
import { categoryService } from '../services/categoryService';
import type { Archive, Category } from '../types';
import { notifications } from '@mantine/notifications';

export function PublicArchivePage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [archivesData, categoriesData] = await Promise.all([
        archiveService.getAll(true),
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
        <Paper p="xl" radius="md" withBorder>
          <Title order={1} mb="xs">
            Arsip Publik
          </Title>
          <Text c="dimmed">
            Jelajahi dan unduh arsip yang tersedia untuk umum
          </Text>
        </Paper>

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
              { value: '', label: 'Semua Kategori' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            value={selectedCategory}
            onChange={setSelectedCategory}
            clearable
          />
        </Group>

        {filteredArchives.length === 0 ? (
          <Paper p="xl" ta="center" withBorder>
            <Text c="dimmed">Tidak ada arsip publik yang ditemukan</Text>
          </Paper>
        ) : (
          <Grid>
            {filteredArchives.map((archive) => (
              <Grid.Col key={archive.id} span={{ base: 12, sm: 6, md: 4 }}>
                <ArchiveCard
                  archive={archive}
                  onDownload={handleDownload}
                  showActions={true}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
