import { Table, Badge, Group, ActionIcon, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconDownload } from '@tabler/icons-react';
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
  return (
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
              {archive.is_public ? (
                <Badge color="green" variant="light">
                  Publik
                </Badge>
              ) : (
                <Badge color="gray" variant="light">
                  Privat
                </Badge>
              )}
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
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  )}
                  {onEdit && (
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => onEdit(archive)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  {onDelete && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => onDelete(archive)}
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
