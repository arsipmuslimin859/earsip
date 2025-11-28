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
  Button,
  Box,
  BackgroundImage,
} from '@mantine/core';
import { IconSearch, IconLogin, IconArchive } from '@tabler/icons-react';
import { ArchiveCard } from '../components/Archive/ArchiveCard';
import { archiveService } from '../services/archiveService';
import { categoryService } from '../services/categoryService';
import { useConfigStore } from '../stores/configStore';
import type { Archive, Category } from '../types';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { config } = useConfigStore();

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

  const filteredArchives = archives.filter((archive) => {
    const matchesSearch =
      archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || archive.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Home Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '4rem 0',
        }}
      >
        <Container size="xl">
          <Stack gap="xl" align="center" ta="center">
            <div>
              <Title order={1} size="3rem" mb="md">
                Selamat Datang di {config.institutionName}
              </Title>
              <Text size="xl" mb="xl" style={{ maxWidth: 600, margin: '0 auto' }}>
                Sistem Manajemen Arsip Modern untuk pengelolaan dokumen dan data penting
                dengan fitur keamanan dan kemudahan akses.
              </Text>
            </div>

            <Group gap="md">
              <Button
                component={Link}
                to="/login"
                size="lg"
                leftSection={<IconLogin size={20} />}
                variant="white"
              >
                Masuk ke Sistem
              </Button>
              <Button
                component="a"
                href="#public-archives"
                size="lg"
                variant="outline"
                style={{ borderColor: 'white', color: 'white' }}
                leftSection={<IconArchive size={20} />}
              >
                Jelajahi Arsip Publik
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Public Archive Section */}
      <Container size="xl" py="xl" id="public-archives">
        <Stack gap="lg">
          <Paper p="xl" radius="md" withBorder>
            <Title order={2} mb="xs">
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

          {loading ? (
            <Center h={200}>
              <Loader size="lg" />
            </Center>
          ) : filteredArchives.length === 0 ? (
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
    </div>
  );
}