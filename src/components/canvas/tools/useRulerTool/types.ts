import type Konva from 'konva';

export type TPoint = { x: number; y: number };

export type TRulerState = {
  start: TPoint;
  point: TPoint;
  isShiftLocked: boolean;
  /** Raw digits typed by the user, overriding the live mouse-driven length until cleared. */
  lengthOverride: string | null;
};

export type TUseRulerToolReturn = {
  draftRuler: TRulerState | null;
  liveLength: number;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};
