import { useState } from 'react';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { Group, Text, Progress, Stack, Paper, CloseButton } from '@mantine/core';
import { IconUpload, IconFile, IconX } from '@tabler/icons-react';
import { useConfigStore } from '../../stores/configStore';

interface ArchiveUploadFormProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  uploading?: boolean;
  uploadProgress?: number;
}

export function ArchiveUploadForm({
  onFileSelect,
  selectedFile,
  uploading = false,
  uploadProgress = 0
}: ArchiveUploadFormProps) {
  const { config } = useConfigStore();

  const handleDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleReject = () => {
    // Handle rejected files (wrong type, too big, etc.)
    console.log('File rejected');
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptTypes = () => {
    const types = config.storage.allowedFileTypes;
    return types.map(type => type.replace('.', ''));
  };

  if (selectedFile) {
    return (
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Group>
            <IconFile size={20} />
            <div>
              <Text size="sm" fw={500}>{selectedFile.name}</Text>
              <Text size="xs" c="dimmed">{formatFileSize(selectedFile.size)}</Text>
            </div>
          </Group>
          <CloseButton onClick={removeFile} disabled={uploading} />
        </Group>

        {uploading && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">Mengupload...</Text>
            <Progress value={uploadProgress} size="sm" />
          </Stack>
        )}
      </Paper>
    );
  }

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={handleReject}
      maxSize={config.storage.maxFileSize}
      accept={getAcceptTypes().reduce((acc, type) => {
        acc[`application/${type}`] = [`.${type}`];
        return acc;
      }, {} as Record<string, string[]>)}
      multiple={false}
      disabled={uploading}
    >
      <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload size={52} color="var(--mantine-color-blue-6)" />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={52} color="var(--mantine-color-red-6)" />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconUpload size={52} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag & drop file di sini atau klik untuk memilih
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            File maksimal {formatFileSize(config.storage.maxFileSize)}
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Tipe file: {config.storage.allowedFileTypes.join(', ')}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}