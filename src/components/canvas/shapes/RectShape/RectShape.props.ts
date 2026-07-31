import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TRectShapeProps = {
  shape: Extract<TShape, { type: 'rect' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Rect | null) => void;
};

export type { TRectShapeProps };
