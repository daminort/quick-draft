import { Path } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'
import { computeArcPath } from '~/lib/arcPath'

interface ArcShapeProps {
  shape: Extract<Shape, { type: 'arc' }>
  draggable: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Path | null) => void
}

export function ArcShape({
  shape,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: ArcShapeProps) {
  return (
    <Path
      ref={setNodeRef}
      x={0}
      y={0}
      data={computeArcPath(shape.cx, shape.cy, shape.r, shape.startAngle, shape.endAngle)}
      stroke={shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
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
