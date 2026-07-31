import { Rect } from 'react-konva';

import { SELECTED_COLOR } from '~/constants/shapes';

import type { TRectShapeProps } from './RectShape.props';
import type Konva from 'konva';

const RectShape = ({
  shape,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TRectShapeProps) => {
  const strokeColor = isSelected ? SELECTED_COLOR : shape.style.stroke;
  const fillOpacity = shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : 1;
  const onNodeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target);
  const onNodeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target);

  return (
    <Rect
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      rotation={shape.rotation}
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

export { RectShape };
