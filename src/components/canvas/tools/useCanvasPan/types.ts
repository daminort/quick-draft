import type Konva from 'konva';

type TUseCanvasPanReturn = {
  isPanning: boolean;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => boolean;
};

export type { TUseCanvasPanReturn };
