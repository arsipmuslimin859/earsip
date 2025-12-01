import { Card, Text, Badge, Group, Stack, ActionIcon, Menu } from '@mantine/core';
import { IconFileText, IconDownload, IconEdit, IconTrash, IconDots, IconLink } from '@tabler/icons-react';
import type { Archive } from '../../types';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface ArchiveCardProps {
  archive: Archive;
  onEdit?: (archive: Archive) => void;
  onDelete?: (archive: Archive) => void;
  onDownload?: (archive: Archive) => void;
  showActions?: boolean;
}

export function ArchiveCard({ archive, onEdit, onDelete, onDownload, showActions = true }: ArchiveCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group>
          <IconFileText size={24} />
          <Text fw={500} size="lg">
            {archive.title}
          </Text>
        </Group>

        {showActions && (
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onDownload && (
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => onDownload(archive)}>
                  Download
                </Menu.Item>
              )}
              {archive.external_url && (
                <Menu.Item
                  leftSection={<IconLink size={14} />}
                  onClick={() => window.open(archive.external_url!, '_blank', 'noopener,noreferrer')}
                >
                  Buka Link Drive
                </Menu.Item>
              )}
              {onEdit && (
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(archive)}>
                  Edit
                </Menu.Item>
              )}
              {onDelete && (
                <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete(archive)}>
                  Hapus
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      {archive.description && (
        <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
          {archive.description}
        </Text>
      )}

      <Stack gap="xs">
        <Group gap="xs">
          {archive.category && (
            <Badge color={archive.category.color} variant="light">
              {archive.category.name}
            </Badge>
          )}
          {archive.is_public && (
            <Badge color="green" variant="light">
              Publik
            </Badge>
          )}
          {archive.external_url && (
            <Badge color="blue" variant="light">
              Drive
            </Badge>
          )}
        </Group>

        {archive.tags && archive.tags.length > 0 && (
          <Group gap="xs">
            {archive.tags.map((tag) => (
              <Badge key={tag.id} size="sm" color={tag.color} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </Group>
        )}

        <Group justify="space-between" mt="md">
          <Text size="xs" c="dimmed">
            {formatFileSize(archive.file_size)}
          </Text>
          <Text size="xs" c="dimmed">
            {formatDate(archive.created_at)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
