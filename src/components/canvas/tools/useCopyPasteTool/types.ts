import type Konva from 'konva';

export type TPoint = { x: number; y: number };

export type TUseCopyPasteToolReturn = {
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};
