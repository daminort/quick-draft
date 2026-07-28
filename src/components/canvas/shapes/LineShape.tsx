import { Line } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'

interface LineShapeProps {
  shape: Extract<Shape, { type: 'line' }>
  draggable: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Line | null) => void
}

export function LineShape({
  shape,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: LineShapeProps) {
  return (
    <Line
      ref={setNodeRef}
      id={shape.id}
      x={shape.x1}
      y={shape.y1}
      points={[0, 0, shape.x2 - shape.x1, shape.y2 - shape.y1]}
      stroke={shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      dash={shape.style.dash}
      hitStrokeWidth={12}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={(e) => onDragMove(e.target)}
      onDragEnd={(e) => onDragEnd(e.target)}
    />
  )
}
