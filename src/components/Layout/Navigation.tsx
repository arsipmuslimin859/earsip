import { NavLink, Stack } from '@mantine/core';
import { IconHome, IconArchive, IconFolder, IconTags, IconActivity, IconWorld } from '@tabler/icons-react';
import { useState } from 'react';

export function Navigation() {
  const [active, setActive] = useState('dashboard');

  const links = [
    { icon: IconHome, label: 'Dashboard', value: 'dashboard' },
    { icon: IconArchive, label: 'Arsip', value: 'archives' },
    { icon: IconFolder, label: 'Kategori', value: 'categories' },
    { icon: IconTags, label: 'Tags', value: 'tags' },
    { icon: IconActivity, label: 'Activity Log', value: 'activity' },
    { icon: IconWorld, label: 'Arsip Publik', value: 'public' },
  ];

  return (
    <Stack gap="xs">
      {links.map((link) => (
        <NavLink
          key={link.value}
          active={active === link.value}
          label={link.label}
          leftSection={<link.icon size={20} />}
          onClick={() => setActive(link.value)}
        />
      ))}
    </Stack>
  );
}
