import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Pagination,
  ColorInput,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconTags, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Tag } from '../types';
import { tagService } from '../services/tagService';

type TagFormValues = {
  name: string;
  color: string;
};

const defaultFormValues: TagFormValues = {
  name: '',
  color: '#0ea5e9',
};

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formValues, setFormValues] = useState<TagFormValues>(defaultFormValues);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat tags',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setFormValues(defaultFormValues);
    setModalOpened(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormValues({
      name: tag.name,
      color: tag.color,
    });
    setModalOpened(true);
  };

  const handleDelete = async (tag: Tag) => {
    const confirmation = window.confirm(`Hapus tag "${tag.name}"?`);
    if (!confirmation) return;

    try {
      await tagService.delete(tag.id);
      setTags((prev) => prev.filter((item) => item.id !== tag.id));
      notifications.show({
        title: 'Berhasil',
        message: 'Tag dihapus',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus tag',
        color: 'red',
      });
    }
  };

  const handleSubmit = async () => {
    if (!formValues.name.trim()) {
      notifications.show({
        title: 'Validasi',
        message: 'Nama tag wajib diisi',
        color: 'orange',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingTag) {
        const updated = await tagService.update(editingTag.id, {
          name: formValues.name,
          color: formValues.color,
        });
        setTags((prev) => prev.map((tag) => (tag.id === updated.id ? (updated as Tag) : tag)));
        notifications.show({
          title: 'Berhasil',
          message: 'Tag diperbarui',
          color: 'green',
        });
      } else {
        const created = await tagService.create({
          name: formValues.name,
          color: formValues.color,
        });
        setTags((prev) => [...prev, created as Tag]);
        notifications.show({
          title: 'Berhasil',
          message: 'Tag ditambahkan',
          color: 'green',
        });
      }

      setModalOpened(false);
      setFormValues(defaultFormValues);
      setEditingTag(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan tag',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredTags = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [searchQuery, tags]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const paginatedTags = filteredTags.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" justify="center" h="50vh">
          <Loader size="lg" />
          <Text c="dimmed">Memuat tags...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Manajemen Tags</Title>
            <Text c="dimmed">Atur daftar tag untuk mengelompokkan arsip</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Tambah Tag
          </Button>
        </Group>

        <Paper withBorder p="md" radius="md">
          <Group grow>
            <TextInput
              placeholder="Cari tag..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.currentTarget.value);
                setPage(1);
              }}
            />
            <Button variant="light" onClick={loadTags}>
              Muat Ulang
            </Button>
          </Group>
        </Paper>

        <Paper withBorder radius="md">
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nama</Table.Th>
                <Table.Th>Warna</Table.Th>
                <Table.Th>Dibuat</Table.Th>
                <Table.Th w={120}>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedTags.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center">
                      Tidak ada tag
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedTags.map((tag) => (
                  <Table.Tr key={tag.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <IconTags size={20} color={tag.color} />
                        <Text fw={600}>{tag.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        style={{
                          backgroundColor: `${tag.color}22`,
                          color: tag.color,
                        }}
                      >
                        {tag.color}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(tag.created_at).toLocaleDateString('id-ID')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          aria-label="Edit tag"
                          onClick={() => handleEdit(tag)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          aria-label="Hapus tag"
                          onClick={() => handleDelete(tag)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        {filteredTags.length > pageSize && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Menampilkan {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, filteredTags.length)} dari {filteredTags.length} tag
            </Text>
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingTag(null);
          setFormValues(defaultFormValues);
        }}
        title={editingTag ? 'Edit Tag' : 'Tambah Tag'}
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Nama Tag"
            placeholder="Contoh: Penting"
            value={formValues.name}
            onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.currentTarget.value }))}
            required
          />
          <ColorInput
            label="Warna"
            value={formValues.color}
            onChange={(value) => setFormValues((prev) => ({ ...prev, color: value }))}
            disallowInput
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              Batal
            </Button>
            <Button loading={saving} onClick={handleSubmit}>
              {editingTag ? 'Simpan Perubahan' : 'Tambah Tag'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

