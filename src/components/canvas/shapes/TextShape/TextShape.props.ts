import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TTextShapeProps = {
  shape: Extract<TShape, { type: 'text' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  isVisible?: boolean;
  onSelect: () => void;
  onDblClick?: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Text | null) => void;
};

export type { TTextShapeProps };
