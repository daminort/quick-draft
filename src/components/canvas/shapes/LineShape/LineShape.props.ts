import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TLineShapeProps = {
  shape: Extract<TShape, { type: 'line' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Line | null) => void;
};

export type { TLineShapeProps };
