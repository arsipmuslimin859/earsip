import { useEffect } from 'react';
import { MantineProvider, createTheme, Paper, Stack, Text, Title } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useAuthStore } from './stores/authStore';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicArchivePage } from './pages/PublicArchivePage';
import { ArchivesPage } from './pages/ArchivesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TagsPage } from './pages/TagsPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
});

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return null;
  }

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <BrowserRouter>
        <AppRoutes user={user} />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;

function AppRoutes({ user }: { user: User | null }) {
  return (
    <Routes>
      <Route path="/public-archive" element={<PublicArchivePage />} />
      {user ? (
        <>
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/archives" element={<ArchivesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/public" element={<PublicArchivePage />} />
          </Route>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

function PrivateLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function FeaturePlaceholder({ title }: { title: string }) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="xs">
        <Title order={2}>{title}</Title>
        <Text c="dimmed">Fitur ini sedang dalam tahap pengembangan.</Text>
      </Stack>
    </Paper>
  );
}
