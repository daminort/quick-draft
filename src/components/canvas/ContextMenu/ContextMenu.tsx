import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { Box, Flex, Button } from '@radix-ui/themes';

import s from './ContextMenu.module.css';

export type TContextMenuItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

type TContextMenuProps = {
  x: number;
  y: number;
  items: TContextMenuItem[];
  onClose: () => void;
};

export function ContextMenu({ x, y, items, onClose }: TContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node)) {
        return;
      }
      onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const menuStyle = { '--menu-left': `${x}px`, '--menu-top': `${y}px` } as React.CSSProperties;
  const onItemClick = (item: TContextMenuItem) => () => {
    item.onClick();
    onClose();
  };

  return (
    <Box ref={menuRef} role="menu" p="2" className={s.menu} style={menuStyle}>
      <Flex direction="column" gap="1">
        {items.map(item => (
          <Button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={onItemClick(item)}
            variant="ghost"
            color="gray"
            className={s.menuItem}
          >
            <Flex align="center" gap="2">
              {item.icon}
              {item.label}
            </Flex>
          </Button>
        ))}
      </Flex>
    </Box>
  );
}
