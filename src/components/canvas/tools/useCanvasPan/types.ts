import type Konva from 'konva';

export type TUseCanvasPanReturn = {
  isPanning: boolean;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => boolean;
};
