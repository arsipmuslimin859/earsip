import { Table, Badge, Group, ActionIcon, Text, Card, Stack, ScrollArea } from '@mantine/core';
import { IconEdit, IconTrash, IconDownload, IconLink } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import type { Archive } from '../../types';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface ArchiveTableProps {
  archives: Archive[];
  onEdit?: (archive: Archive) => void;
  onDelete?: (archive: Archive) => void;
  onDownload?: (archive: Archive) => void;
  showActions?: boolean;
}

export function ArchiveTable({ archives, onEdit, onDelete, onDownload, showActions = true }: ArchiveTableProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <ScrollArea style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        {archives.map((archive) => (
          <Card key={archive.id} withBorder style={{ minWidth: 300, flexShrink: 0 }}>
            <Stack gap="sm">
              <div>
                <Text fw={500}>{archive.title}</Text>
                {archive.description && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {archive.description}
                  </Text>
                )}
              </div>
              <div>
                <Text size="sm" fw={500}>Kategori:</Text>
                {archive.category && (
                  <Badge color={archive.category.color} variant="light" size="sm">
                    {archive.category.name}
                  </Badge>
                )}
              </div>
              <div>
                <Text size="sm" fw={500}>Ukuran:</Text>
                <Text size="sm">{formatFileSize(archive.file_size)}</Text>
              </div>
              <div>
                <Text size="sm" fw={500}>Status:</Text>
                <Group gap={4} mt={4}>
                  {archive.is_public ? (
                    <Badge color="green" variant="light" size="sm">
                      Publik
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="light" size="sm">
                      Privat
                    </Badge>
                  )}
                  {archive.external_url && (
                    <Badge color="blue" variant="light" size="sm">
                      Drive
                    </Badge>
                  )}
                </Group>
              </div>
              <div>
                <Text size="sm" fw={500}>Tanggal Upload:</Text>
                <Text size="sm">{formatDate(archive.created_at)}</Text>
              </div>
              {showActions && (
                <Group gap="xs" mt="sm">
                  {onDownload && (
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => onDownload(archive)}
                      title="Download arsip"
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  )}
                  {archive.external_url && (
                    <ActionIcon
                      variant="light"
                      color="green"
                      onClick={() => window.open(archive.external_url!, '_blank', 'noopener,noreferrer')}
                      title="Buka link Drive"
                    >
                      <IconLink size={16} />
                    </ActionIcon>
                  )}
                  {onEdit && (
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => onEdit(archive)}
                      title="Edit arsip"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  {onDelete && (
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => onDelete(archive)}
                      title="Hapus arsip"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              )}
            </Stack>
          </Card>
        ))}
      </div>
    </ScrollArea>
  ) : (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Judul</Table.Th>
          <Table.Th>Kategori</Table.Th>
          <Table.Th>Ukuran</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Tanggal Upload</Table.Th>
          {showActions && <Table.Th>Aksi</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {archives.map((archive) => (
          <Table.Tr key={archive.id}>
            <Table.Td>
              <Text fw={500}>{archive.title}</Text>
              {archive.description && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {archive.description}
                </Text>
              )}
            </Table.Td>
            <Table.Td>
              {archive.category && (
                <Badge color={archive.category.color} variant="light">
                  {archive.category.name}
                </Badge>
              )}
            </Table.Td>
            <Table.Td>
              <Text size="sm">{formatFileSize(archive.file_size)}</Text>
            </Table.Td>
            <Table.Td>
              <Group gap={4}>
                {archive.is_public ? (
                  <Badge color="green" variant="light">
                    Publik
                  </Badge>
                ) : (
                  <Badge color="gray" variant="light">
                    Privat
                  </Badge>
                )}
                {archive.external_url && (
                  <Badge color="blue" variant="light">
                    Drive
                  </Badge>
                )}
              </Group>
            </Table.Td>
            <Table.Td>
              <Text size="sm">{formatDate(archive.created_at)}</Text>
            </Table.Td>
            {showActions && (
              <Table.Td>
                <Group gap="xs">
                  {onDownload && (
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => onDownload(archive)}
                      title="Download arsip"
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  )}
                  {archive.external_url && (
                    <ActionIcon
                      variant="subtle"
                      color="green"
                      onClick={() => window.open(archive.external_url!, '_blank', 'noopener,noreferrer')}
                      title="Buka link Drive"
                    >
                      <IconLink size={16} />
                    </ActionIcon>
                  )}
                  {onEdit && (
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => onEdit(archive)}
                      title="Edit arsip"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  {onDelete && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => onDelete(archive)}
                      title="Hapus arsip"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
