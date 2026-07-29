import type { TShape, TShapeId } from '~/types/document';

import type Konva from 'konva';

export type TShapeInteraction = {
  registerNode: (id: TShapeId, node: Konva.Node | null) => void;
  selectShape: (id: TShapeId) => void;
  handleDragStart: (shape: TShape) => void;
  handleDragMove: (shape: TShape, node: Konva.Node) => void;
  handleDragEnd: (shape: TShape, node: Konva.Node) => void;
  handleManualMouseDown: (shape: TShape, e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export type TViewBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/** Renders shapes read-only: no click/drag handlers attached, nodes not registered anywhere. */
export const noopShapeInteraction: TShapeInteraction = {
  registerNode: () => {},
  selectShape: () => {},
  handleDragStart: () => {},
  handleDragMove: () => {},
  handleDragEnd: () => {},
  handleManualMouseDown: () => {},
};
