import type Konva from 'konva'
import type { Shape, ShapeId } from '~/types/document'
import { LineShape } from '~/components/canvas/shapes/LineShape'
import { RectShape } from '~/components/canvas/shapes/RectShape'
import { CircleShape } from '~/components/canvas/shapes/CircleShape'
import { ArcShape } from '~/components/canvas/shapes/ArcShape'
import { TextShape } from '~/components/canvas/shapes/TextShape'

export interface ShapeInteraction {
  registerNode: (id: ShapeId, node: Konva.Node | null) => void
  selectShape: (id: ShapeId) => void
  handleDragStart: (id: ShapeId) => void
  handleDragMove: (shape: Shape, node: Konva.Node) => void
  handleDragEnd: (shape: Shape, node: Konva.Node) => void
}

interface ShapeRendererProps {
  shape: Shape
  interactive: boolean
  interaction: ShapeInteraction
}

export function ShapeRenderer({ shape, interactive, interaction }: ShapeRendererProps) {
  const shared = {
    draggable: interactive,
    onSelect: () => interaction.selectShape(shape.id),
    onDragStart: () => interaction.handleDragStart(shape.id),
    onDragMove: (node: Konva.Node) => interaction.handleDragMove(shape, node),
    onDragEnd: (node: Konva.Node) => interaction.handleDragEnd(shape, node),
    setNodeRef: (node: Konva.Node | null) => interaction.registerNode(shape.id, node),
  }

  switch (shape.type) {
    case 'line':
      return <LineShape shape={shape} {...shared} />
    case 'rect':
      return <RectShape shape={shape} {...shared} />
    case 'circle':
      return <CircleShape shape={shape} {...shared} />
    case 'arc':
      return <ArcShape shape={shape} {...shared} />
    case 'text':
      return <TextShape shape={shape} {...shared} />
    default:
      return null
  }
}
