import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  ColorInput,
  Container,
  Pagination,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import {
  IconArchive,
  IconBoxSeam,
  IconCheck,
  IconClipboardData,
  IconEdit,
  IconFileDescription,
  IconFolder,
  IconHash,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types';

type CategoryFormValues = {
  name: string;
  description: string;
  color: string;
  icon: string;
  parent_id: string | null;
};

const defaultFormValues: CategoryFormValues = {
  name: '',
  description: '',
  color: '#1d4ed8',
  icon: 'IconFolder',
  parent_id: null,
};

const ICON_OPTIONS = [
  { label: 'Folder', value: 'IconFolder', icon: IconFolder },
  { label: 'Arsip', value: 'IconArchive', icon: IconArchive },
  { label: 'Dokumen', value: 'IconFileDescription', icon: IconFileDescription },
  { label: 'Data', value: 'IconClipboardData', icon: IconClipboardData },
  { label: 'Box', value: 'IconBoxSeam', icon: IconBoxSeam },
  { label: '# Tag', value: 'IconHash', icon: IconHash },
];

const iconComponentMap = ICON_OPTIONS.reduce<Record<string, ComponentType<any>>>(
  (acc, option) => {
    acc[option.value] = option.icon;
    return acc;
  },
  {},
);

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>(defaultFormValues);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat kategori',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormValues(defaultFormValues);
    setEditingCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpened(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormValues({
      name: category.name,
      description: category.description ?? '',
      color: category.color,
      icon: category.icon || 'IconFolder',
      parent_id: category.parent_id,
    });
    setModalOpened(true);
  };

  const handleDelete = async (category: Category) => {
    const confirmation = window.confirm(`Hapus kategori "${category.name}"?`);
    if (!confirmation) return;

    try {
      await categoryService.delete(category.id);
      setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
      notifications.show({
        title: 'Berhasil',
        message: 'Kategori berhasil dihapus',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus kategori',
        color: 'red',
      });
    }
  };

  const handleFormChange = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.name.trim()) {
      notifications.show({
        title: 'Validasi',
        message: 'Nama kategori wajib diisi',
        color: 'orange',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const updated = await categoryService.update(editingCategory.id, {
          name: formValues.name,
          description: formValues.description || null,
          color: formValues.color,
          icon: formValues.icon,
          parent_id: formValues.parent_id,
        });
        setCategories((prev) => prev.map((cat) => (cat.id === updated.id ? updated : cat)));
        notifications.show({
          title: 'Berhasil',
          message: 'Kategori diperbarui',
          color: 'green',
        });
      } else {
        const created = await categoryService.create({
          name: formValues.name,
          description: formValues.description || null,
          color: formValues.color,
          icon: formValues.icon,
          parent_id: formValues.parent_id,
        });
        setCategories((prev) => [...prev, created as Category]);
        notifications.show({
          title: 'Berhasil',
          message: 'Kategori ditambahkan',
          color: 'green',
        });
      }

      setModalOpened(false);
      resetForm();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan kategori',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return categories.filter((category) => {
      const matchesName = category.name.toLowerCase().includes(query);
      const matchesDescription = category.description?.toLowerCase().includes(query);
      return matchesName || matchesDescription;
    });
  }, [categories, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const parentOptions = useMemo(
    () =>
      categories
        .filter((category) => !editingCategory || category.id !== editingCategory.id)
        .map((category) => ({
          value: category.id,
          label: category.name,
        })),
    [categories, editingCategory],
  );

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" justify="center" h="50vh">
          <Loader size="lg" />
          <Text c="dimmed">Memuat kategori...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Manajemen Kategori</Title>
            <Text c="dimmed">Atur struktur kategori arsip, warna, dan hierarki</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
            Tambah Kategori
          </Button>
        </Group>

        <Paper withBorder p="md" radius="md">
          <Group grow>
            <TextInput
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.currentTarget.value);
                setPage(1);
              }}
            />
            <Button variant="light" onClick={loadCategories}>
              Muat Ulang
            </Button>
          </Group>
        </Paper>

        <Paper withBorder radius="md">
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nama</Table.Th>
                <Table.Th>Deskripsi</Table.Th>
                <Table.Th>Parent</Table.Th>
                <Table.Th>Warna</Table.Th>
                <Table.Th w={120}>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedCategories.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center">
                      Tidak ada kategori
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedCategories.map((category) => {
                  const IconComponent =
                    iconComponentMap[category.icon] ?? iconComponentMap[defaultFormValues.icon];
                  return (
                    <Table.Tr key={category.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Paper
                            withBorder
                            p={8}
                            radius="md"
                            style={{ backgroundColor: `${category.color}22` }}
                          >
                            <IconComponent size={20} />
                          </Paper>
                          <Stack gap={0} justify="center">
                            <Text fw={600}>{category.name}</Text>
                            {category.description && (
                              <Text size="xs" c="dimmed">
                                {category.description}
                              </Text>
                            )}
                          </Stack>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {category.description ? (
                          <Text size="sm">{category.description}</Text>
                        ) : (
                          <Text size="sm" c="dimmed">
                            -
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {category.parent_id ? (
                          <Badge>
                            {categories.find((cat) => cat.id === category.parent_id)?.name ?? 'Parent'}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            Root
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Badge
                            variant="light"
                            style={{
                              backgroundColor: `${category.color}22`,
                              color: category.color,
                            }}
                          >
                            {category.color}
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            aria-label="Edit kategori"
                            onClick={() => handleEdit(category)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            aria-label="Hapus kategori"
                            onClick={() => handleDelete(category)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        {filteredCategories.length > pageSize && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Menampilkan {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, filteredCategories.length)} dari{' '}
              {filteredCategories.length} kategori
            </Text>
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          resetForm();
        }}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Nama Kategori"
            placeholder="Contoh: Surat Masuk"
            value={formValues.name}
            onChange={(event) => handleFormChange('name', event.currentTarget.value)}
            required
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi singkat"
            value={formValues.description}
            onChange={(event) => handleFormChange('description', event.currentTarget.value)}
            minRows={3}
          />
          <Select
            label="Kategori Induk"
            placeholder="Tidak ada"
            data={parentOptions}
            value={formValues.parent_id ?? ''}
            onChange={(value) => handleFormChange('parent_id', value || null)}
            searchable
            clearable
          />
          <ColorInput
            label="Warna"
            value={formValues.color}
            onChange={(value) => handleFormChange('color', value)}
            format="hex"
            disallowInput
          />
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Icon
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const selected = formValues.icon === option.value;
                return (
                  <Paper
                    key={option.value}
                    withBorder
                    radius="md"
                    p="sm"
                    onClick={() => handleFormChange('icon', option.value)}
                    style={{
                      cursor: 'pointer',
                      borderColor: selected ? 'var(--mantine-color-blue-filled)' : undefined,
                      backgroundColor: selected ? 'var(--mantine-color-blue-light)' : undefined,
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="xs" wrap="nowrap">
                        <IconComponent size={20} />
                        <Text size="sm">{option.label}</Text>
                      </Group>
                      {selected && <IconCheck size={16} />}
                    </Group>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              Batal
            </Button>
            <Button loading={saving} onClick={handleSubmit}>
              {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

