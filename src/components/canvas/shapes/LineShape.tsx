import { Line } from 'react-konva';

import type { TShape } from '~/types/document';

import { SELECTED_COLOR } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import type Konva from 'konva';

type TLineShapeProps = {
  shape: Extract<TShape, { type: 'line' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Line | null) => void;
};

export function LineShape({
  shape,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TLineShapeProps) {
  return (
    <Line
      ref={setNodeRef}
      id={shape.id}
      x={shape.x1}
      y={shape.y1}
      points={[0, 0, shape.x2 - shape.x1, shape.y2 - shape.y1]}
      stroke={isSelected ? SELECTED_COLOR : shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      dash={shape.style.dash}
      hitStrokeWidth={HIT_STROKE_WIDTH}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={e => onDragMove(e.target)}
      onDragEnd={e => onDragEnd(e.target)}
    />
  );
}
