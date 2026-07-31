import type { TShape, TShapeId } from '~/types/document';

import type Konva from 'konva';

type TShapeInteraction = {
  registerNode: (id: TShapeId, node: Konva.Node | null) => void;
  selectShape: (id: TShapeId) => void;
  onDragStart: (shape: TShape) => void;
  onDragMove: (shape: TShape, node: Konva.Node) => void;
  onDragEnd: (shape: TShape, node: Konva.Node) => void;
  onManualMouseDown: (shape: TShape, e: Konva.KonvaEventObject<MouseEvent>) => void;
};

type TViewBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/** Renders shapes read-only: no click/drag handlers attached, nodes not registered anywhere. */
const noopShapeInteraction: TShapeInteraction = {
  registerNode: () => {},
  selectShape: () => {},
  onDragStart: () => {},
  onDragMove: () => {},
  onDragEnd: () => {},
  onManualMouseDown: () => {},
};

export type { TShapeInteraction, TViewBounds };
export { noopShapeInteraction };
