import type { TShape } from '~/types/document';

import type Konva from 'konva';

export type TPoint = { x: number; y: number };
export type TArcPhase = 'radius' | 'angle';
export type TDimensionPhase = 'second-point';
export type TSnapIndicator = { x: number | null; y: number | null };

export type TUseDrawingToolReturn = {
  draftShape: TShape | null;
  snapIndicator: TSnapIndicator;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: () => void;
};
