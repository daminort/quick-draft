import { Line } from 'react-konva';

import { SELECTED_COLOR } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import type { TLineShapeProps } from './LineShape.props';
import type Konva from 'konva';

function LineShape({
  shape,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TLineShapeProps) {
  const strokeColor = isSelected ? SELECTED_COLOR : shape.style.stroke;
  const onNodeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target);
  const onNodeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target);

  return (
    <Line
      ref={setNodeRef}
      id={shape.id}
      x={shape.x1}
      y={shape.y1}
      points={[0, 0, shape.x2 - shape.x1, shape.y2 - shape.y1]}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onNodeDragMove}
      onDragEnd={onNodeDragEnd}
      stroke={strokeColor}
      strokeWidth={shape.style.strokeWidth}
      dash={shape.style.dash}
      hitStrokeWidth={HIT_STROKE_WIDTH}
    />
  );
}

export { LineShape };
