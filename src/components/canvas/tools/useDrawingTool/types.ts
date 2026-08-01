import type { TShape } from '~/types/document';

import type Konva from 'konva';

type TPoint = { x: number; y: number };
type TArcPhase = 'radius' | 'angle';
type TDimensionPhase = 'second-point';
type TSnapIndicator = { x: number | null; y: number | null };

type TUseDrawingToolReturn = {
  draftShape: TShape | null;
  snapIndicator: TSnapIndicator;
  arcPhase: TArcPhase | null;
  dimensionPhase: TDimensionPhase | null;
  /** True once the active tool has fully committed a shape — the hint for it should stop showing
   * until the user switches away and back. Resets whenever the active tool changes. */
  isHintDismissed: boolean;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: () => void;
};

export type { TPoint, TArcPhase, TDimensionPhase, TSnapIndicator, TUseDrawingToolReturn };
