import { Group } from 'react-konva'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer'
import { noopShapeInteraction, type ViewBounds } from '~/components/canvas/shapes/ShapeInteraction'
import type { Shape } from '~/types/document'

const INNER_VIEW_BOUNDS: ViewBounds = { left: -1e5, top: -1e5, right: 1e5, bottom: 1e5 }

interface ComponentInstanceShapeProps {
  shape: Extract<Shape, { type: 'component-instance' }>
  draggable: boolean
  selected?: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Group | null) => void
}

export function ComponentInstanceShape({
  shape,
  draggable,
  selected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: ComponentInstanceShapeProps) {
  const componentDef = useDocumentStore((state) => state.document.components[shape.componentId])
  if (!componentDef) return null

  return (
    <Group
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      scaleX={shape.scale}
      scaleY={shape.scale}
      rotation={shape.rotation}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={(e) => onDragMove(e.target)}
      onDragEnd={(e) => onDragEnd(e.target)}
    >
      {componentDef.shapes.map((childShape) => (
        <ShapeRenderer
          key={childShape.id}
          shape={childShape}
          interactive={false}
          interaction={noopShapeInteraction}
          viewBounds={INNER_VIEW_BOUNDS}
          selected={selected}
        />
      ))}
    </Group>
  )
}
