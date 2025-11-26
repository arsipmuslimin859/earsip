import { useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useAuthStore } from './stores/authStore';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicArchivePage } from './pages/PublicArchivePage';
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

  const path = window.location.pathname;

  if (path === '/public-archive') {
    return (
      <MantineProvider theme={theme}>
        <Notifications />
        <PublicArchivePage />
      </MantineProvider>
    );
  }

  if (!user) {
    return (
      <MantineProvider theme={theme}>
        <Notifications />
        <LoginPage />
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </MantineProvider>
  );
}

export default App;
