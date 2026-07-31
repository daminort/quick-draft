import type { TShape } from '~/types/document';

import type { TViewBounds } from '~/components/canvas/shapes/ShapeInteraction';

import type Konva from 'konva';

type TGuideShapeProps = {
  shape: Extract<TShape, { type: 'guide' }>;
  viewBounds: TViewBounds;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Line | null) => void;
};

export type { TGuideShapeProps };
