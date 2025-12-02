import { NavLink, Stack } from '@mantine/core';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';

interface NavigationLink {
  icon: ComponentType<any>;
  label: string;
  path: string;
}

interface NavigationProps {
  links: NavigationLink[];
  activePath: string;
  onNavigate?: () => void;
}

export function Navigation({ links, activePath, onNavigate }: NavigationProps) {
  return (
    <Stack gap="sm">
      {links.map((link) => {
        const IconComponent = link.icon;
        return (
          <NavLink
            key={link.path}
            component={Link}
            to={link.path}
            active={activePath === link.path}
            label={link.label}
            leftSection={<IconComponent size={20} />}
            onClick={onNavigate}
          />
        );
      })}
    </Stack>
  );
}
