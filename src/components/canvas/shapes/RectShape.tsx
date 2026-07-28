import { Rect } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'

interface RectShapeProps {
  shape: Extract<Shape, { type: 'rect' }>
  draggable: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Rect | null) => void
}

export function RectShape({
  shape,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: RectShapeProps) {
  return (
    <Rect
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      rotation={shape.rotation}
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
