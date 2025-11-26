import { TextInput, PasswordInput, Button, Paper, Title, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email tidak valid'),
      password: (value) => (value.length >= 6 ? null : 'Password minimal 6 karakter'),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      notifications.show({
        title: 'Berhasil',
        message: 'Login berhasil',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Login gagal',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Title order={2} ta="center" mb="md">
        Login Sistem Arsip
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Masuk ke sistem manajemen arsip
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            required
            label="Email"
            placeholder="email@contoh.com"
            {...form.getInputProps('email')}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Password"
            {...form.getInputProps('password')}
          />

          <Button type="submit" fullWidth loading={loading}>
            Masuk
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
