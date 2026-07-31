import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TArcShapeProps = {
  shape: Extract<TShape, { type: 'arc' }>;
  isInteractive: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  setNodeRef: (node: Konva.Path | null) => void;
};

export type { TArcShapeProps };
