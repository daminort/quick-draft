import { Circle } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'

interface CircleShapeProps {
  shape: Extract<Shape, { type: 'circle' }>
  draggable: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Circle | null) => void
}

export function CircleShape({
  shape,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: CircleShapeProps) {
  return (
    <Circle
      ref={setNodeRef}
      id={shape.id}
      x={shape.cx}
      y={shape.cy}
      radius={shape.r}
      stroke={shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
      dash={shape.style.dash}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={(e) => onDragMove(e.target)}
      onDragEnd={(e) => onDragEnd(e.target)}
    />
  )
}
