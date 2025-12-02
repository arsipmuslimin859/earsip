import { AppShell, Burger, Group, Text, useMantineColorScheme, ActionIcon, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMoon, IconSun, IconLogout, IconHome, IconArchive, IconFolder, IconTags, IconActivity, IconWorld, IconTable, IconDotsVertical } from '@tabler/icons-react';
import { useAuthStore } from '../../stores/authStore';
import { useConfigStore } from '../../stores/configStore';
import { Navigation } from './Navigation';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { icon: IconHome, label: 'Dashboard', path: '/dashboard' },
  { icon: IconArchive, label: 'Arsip', path: '/archives' },
  { icon: IconFolder, label: 'Kategori', path: '/categories' },
  { icon: IconTags, label: 'Tags', path: '/tags' },
  { icon: IconTable, label: 'Struktur Arsip Dinamis', path: '/custom-tables' },
  { icon: IconActivity, label: 'Activity Log', path: '/activity' },
  { icon: IconWorld, label: 'Arsip Publik', path: '/public' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { user, signOut } = useAuthStore();
  const { config } = useConfigStore();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const activePath =
    navLinks
      .filter((link) => {
        if (link.path === '/dashboard') {
          return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(link.path);
      })
      .sort((a, b) => b.path.length - a.path.length)[0]?.path ?? '/dashboard';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: '100%', sm: 250 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="lg" fw={700}>
              {config.institutionName}
            </Text>
          </Group>

          <Group>
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>

            {user && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="default" size="lg">
                    <IconDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    onClick={handleSignOut}
                  >
                    Keluar
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={{ base: 'lg', sm: 'md' }}>
        <Navigation
          links={navLinks}
          activePath={activePath}
          onNavigate={() => {
            if (opened) toggle();
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer p="sm" style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--mantine-color-dimmed)' }}>
        Dibuat oleh Muhammad Irfan, lulusan tahun 2021
      </AppShell.Footer>
    </AppShell>
  );
}
