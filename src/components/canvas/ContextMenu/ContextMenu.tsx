import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { Box, Flex, Button } from '@radix-ui/themes';

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

  const menuStyle = {
    position: 'fixed' as const,
    left: x,
    top: y,
    zIndex: 1000,
    background: 'var(--color-panel-solid)',
    border: '1px solid var(--gray-a5)',
    borderRadius: 'var(--radius-3)',
    boxShadow: 'var(--shadow-5)',
    minWidth: 160,
  };
  const menuItemStyle = { justifyContent: 'flex-start' };

  return (
    <Box ref={menuRef} role="menu" p="2" style={menuStyle}>
      <Flex direction="column" gap="1">
        {items.map(item => (
          <Button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            variant="ghost"
            color="gray"
            style={menuItemStyle}
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
