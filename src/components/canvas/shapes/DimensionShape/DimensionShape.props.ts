import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TDimensionShapeProps = {
  shape: Extract<TShape, { type: 'dimension' }>;
  isSelected?: boolean;
  isInteractive: boolean;
  onSelect: () => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  setNodeRef: (node: Konva.Group | null) => void;
};

export type { TDimensionShapeProps };
