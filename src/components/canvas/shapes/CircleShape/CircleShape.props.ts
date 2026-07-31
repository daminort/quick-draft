import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TCircleShapeProps = {
  shape: Extract<TShape, { type: 'circle' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Circle | null) => void;
};

export type { TCircleShapeProps };
