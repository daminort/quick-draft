import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TPoint = { x: number; y: number };
type TArcPhase = 'radius' | 'angle';
type TDimensionPhase = 'second-point';
type TSnapIndicator = { x: number | null; y: number | null };

type TUseDrawingToolReturn = {
  draftShape: TShape | null;
  snapIndicator: TSnapIndicator;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: () => void;
};

export type { TPoint, TArcPhase, TDimensionPhase, TSnapIndicator, TUseDrawingToolReturn };
