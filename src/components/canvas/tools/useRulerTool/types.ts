import type Konva from 'konva';

type TPoint = { x: number; y: number };

type TRulerState = {
  start: TPoint;
  point: TPoint;
  isShiftLocked: boolean;
  /** Raw digits typed by the user, overriding the live mouse-driven length until cleared. */
  lengthOverride: string | null;
};

type TUseRulerToolReturn = {
  draftRuler: TRulerState | null;
  liveLength: number;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export type { TPoint, TRulerState, TUseRulerToolReturn };
