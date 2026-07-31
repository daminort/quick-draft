import type Konva from 'konva';

type TPoint = { x: number; y: number };

type TUseCopyPasteToolReturn = {
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export type { TPoint, TUseCopyPasteToolReturn };
