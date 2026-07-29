import { Rect } from 'react-konva';

import type { TShape } from '~/types/document';

import { SELECTED_COLOR } from '~/constants/shapes';

import type Konva from 'konva';

type TRectShapeProps = {
  shape: Extract<TShape, { type: 'rect' }>;
  draggable: boolean;
  selected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Rect | null) => void;
};

export function RectShape({
  shape,
  draggable,
  selected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TRectShapeProps) {
  return (
    <Rect
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      rotation={shape.rotation}
      stroke={selected ? SELECTED_COLOR : shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
      opacity={shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : 1}
      perfectDrawEnabled={false}
      dash={shape.style.dash}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={e => onDragMove(e.target)}
      onDragEnd={e => onDragEnd(e.target)}
    />
  );
}
