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
  /** True once the ruler has committed a measurement — the hint should stop showing until the
   * user switches away and back. Resets whenever the active tool changes. */
  isHintDismissed: boolean;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export type { TPoint, TRulerState, TUseRulerToolReturn };
