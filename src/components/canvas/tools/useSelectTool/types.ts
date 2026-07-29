import type { TShape, TShapeId } from '~/types/document';

import type Konva from 'konva';

export type TPoint = { x: number; y: number };
export type TSnapIndicator = { x: number | null; y: number | null };
export type TMarqueeRect = { x: number; y: number; width: number; height: number };

export type TManualDrag = {
  origin: TShape;
  startPointer: TPoint;
  stage: Konva.Stage;
};

export type TMarqueeDrag = {
  stage: Konva.Stage;
  startPointer: TPoint;
  startClientPointer: TPoint;
};

export type TUseSelectToolReturn = {
  registerNode: (id: TShapeId, node: Konva.Node | null) => void;
  getNode: (id: TShapeId) => Konva.Node | null;
  selectShape: (id: TShapeId) => void;
  onStageMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragStart: (shape: TShape) => void;
  onDragMove: (shape: TShape, node: Konva.Node) => void;
  onDragEnd: (shape: TShape, node: Konva.Node) => void;
  onManualMouseDown: (shape: TShape, e: Konva.KonvaEventObject<MouseEvent>) => void;
  snapIndicator: TSnapIndicator;
  marqueeRect: TMarqueeRect | null;
};
