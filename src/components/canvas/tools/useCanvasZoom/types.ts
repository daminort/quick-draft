import type Konva from 'konva';

export type TStageSize = { width: number; height: number };

export type TUseCanvasZoomReturn = {
  scale: number;
  x: number;
  y: number;
  onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
};
