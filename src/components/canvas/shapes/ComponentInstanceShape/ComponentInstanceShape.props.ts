import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TComponentInstanceShapeProps = {
  shape: Extract<TShape, { type: 'component-instance' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Group | null) => void;
};

export type { TComponentInstanceShapeProps };
