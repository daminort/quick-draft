import { Circle } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'
import { SELECTED_COLOR } from '~/constants/shapes'

interface CircleShapeProps {
  shape: Extract<Shape, { type: 'circle' }>
  draggable: boolean
  selected?: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Circle | null) => void
}

export function CircleShape({
  shape,
  draggable,
  selected = false,
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
      onDragMove={(e) => onDragMove(e.target)}
      onDragEnd={(e) => onDragEnd(e.target)}
    />
  )
}
