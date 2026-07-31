import type Konva from 'konva';

type TStageSize = { width: number; height: number };

type TUseCanvasZoomReturn = {
  scale: number;
  x: number;
  y: number;
  onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
};

export type { TStageSize, TUseCanvasZoomReturn };
