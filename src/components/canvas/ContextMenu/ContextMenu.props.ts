import type { ReactNode } from 'react';

type TContextMenuItem = {
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

export type { TContextMenuItem, TContextMenuProps };
