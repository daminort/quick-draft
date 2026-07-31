import type { TShape, TShapeId } from '~/types/document';

import type Konva from 'konva';

type TPoint = { x: number; y: number };
type TSnapIndicator = { x: number | null; y: number | null };
type TMarqueeRect = { x: number; y: number; width: number; height: number };

type TManualDrag = {
  origin: TShape;
  startPointer: TPoint;
  stage: Konva.Stage;
};

type TMarqueeDrag = {
  stage: Konva.Stage;
  startPointer: TPoint;
  startClientPointer: TPoint;
};

type TUseSelectToolReturn = {
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

export type {
  TPoint,
  TSnapIndicator,
  TMarqueeRect,
  TManualDrag,
  TMarqueeDrag,
  TUseSelectToolReturn,
};
