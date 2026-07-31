import { Circle } from 'react-konva';

import { SELECTED_COLOR } from '~/constants/shapes';

import type { TCircleShapeProps } from './CircleShape.props';
import type Konva from 'konva';

const CircleShape = ({
  shape,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TCircleShapeProps) => {
  const strokeColor = isSelected ? SELECTED_COLOR : shape.style.stroke;
  const fillOpacity = shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : 1;
  const onNodeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target);
  const onNodeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target);

  return (
    <Circle
      ref={setNodeRef}
      id={shape.id}
      x={shape.cx}
      y={shape.cy}
      radius={shape.r}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onNodeDragMove}
      onDragEnd={onNodeDragEnd}
      stroke={strokeColor}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
      opacity={fillOpacity}
      perfectDrawEnabled={false}
      dash={shape.style.dash}
    />
  );
};

export { CircleShape };
