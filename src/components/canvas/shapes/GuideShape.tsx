import { Line } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'
import type { ViewBounds } from '~/components/canvas/shapes/ShapeRenderer'

const GUIDE_COLOR = 'rgba(59, 130, 246, 0.6)'
const GUIDE_DASH = [4, 4]
const GUIDE_REACH = 100000

interface GuideShapeProps {
  shape: Extract<Shape, { type: 'guide' }>
  viewBounds: ViewBounds
  draggable: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Line | null) => void
}

export function GuideShape({
  shape,
  viewBounds,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: GuideShapeProps) {
  const common = {
    ref: setNodeRef,
    stroke: GUIDE_COLOR,
    strokeWidth: 1,
    dash: GUIDE_DASH,
    hitStrokeWidth: 12,
    listening: draggable,
    draggable,
    onClick: onSelect,
    onTap: onSelect,
    onDragStart,
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target),
  }

  if (shape.orientation === 'v') {
    return (
      <Line
        {...common}
        x={shape.position}
        y={0}
        points={[0, viewBounds.top, 0, viewBounds.bottom]}
        dragBoundFunc={(pos) => ({ x: pos.x, y: 0 })}
      />
    )
  }

  if (shape.orientation === 'angle') {
    const angleRad = ((shape.angle ?? 0) * Math.PI) / 180
    const dx = Math.cos(angleRad) * GUIDE_REACH
    const dy = Math.sin(angleRad) * GUIDE_REACH
    return (
      <Line
        {...common}
        x={0}
        y={shape.position}
        points={[-dx, -dy, dx, dy]}
        dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
      />
    )
  }

  return (
    <Line
      {...common}
      x={0}
      y={shape.position}
      points={[viewBounds.left, 0, viewBounds.right, 0]}
      dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
    />
  )
}
