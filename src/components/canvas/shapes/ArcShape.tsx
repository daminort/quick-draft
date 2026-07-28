import { Path } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'
import { computeArcPath } from '~/lib/arcPath'

const SELECTED_COLOR = '#1d4ed8'

interface ArcShapeProps {
  shape: Extract<Shape, { type: 'arc' }>
  interactive: boolean
  selected?: boolean
  onSelect: () => void
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  setNodeRef: (node: Konva.Path | null) => void
}

export function ArcShape({
  shape,
  interactive,
  selected = false,
  onSelect,
  onMouseDown,
  setNodeRef,
}: ArcShapeProps) {
  return (
    <Path
      ref={setNodeRef}
      id={shape.id}
      x={0}
      y={0}
      data={computeArcPath(shape.cx, shape.cy, shape.r, shape.startAngle, shape.endAngle)}
      stroke={selected ? SELECTED_COLOR : shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
      dash={shape.style.dash}
      hitStrokeWidth={12}
      onClick={onSelect}
      onTap={onSelect}
      onMouseDown={interactive ? onMouseDown : undefined}
    />
  )
}
