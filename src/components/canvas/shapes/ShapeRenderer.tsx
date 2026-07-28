import type Konva from 'konva'
import type { Shape, ShapeId } from '~/types/document'
import { LineShape } from '~/components/canvas/shapes/LineShape'
import { RectShape } from '~/components/canvas/shapes/RectShape'
import { CircleShape } from '~/components/canvas/shapes/CircleShape'
import { ArcShape } from '~/components/canvas/shapes/ArcShape'
import { TextShape } from '~/components/canvas/shapes/TextShape'
import { GuideShape } from '~/components/canvas/shapes/GuideShape'
import { DimensionShape } from '~/components/canvas/shapes/DimensionShape'

export interface ShapeInteraction {
  registerNode: (id: ShapeId, node: Konva.Node | null) => void
  selectShape: (id: ShapeId) => void
  handleDragStart: (shape: Shape) => void
  handleDragMove: (shape: Shape, node: Konva.Node) => void
  handleDragEnd: (shape: Shape, node: Konva.Node) => void
  handleManualMouseDown: (shape: Shape, e: Konva.KonvaEventObject<MouseEvent>) => void
}

export interface ViewBounds {
  left: number
  top: number
  right: number
  bottom: number
}

interface ShapeRendererProps {
  shape: Shape
  interactive: boolean
  interaction: ShapeInteraction
  viewBounds: ViewBounds
  selected?: boolean
}

export function ShapeRenderer({
  shape,
  interactive,
  interaction,
  viewBounds,
  selected = false,
}: ShapeRendererProps) {
  const shared = {
    draggable: interactive,
    onSelect: interactive ? () => interaction.selectShape(shape.id) : () => {},
    onDragStart: () => interaction.handleDragStart(shape),
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
      return (
        <ArcShape
          shape={shape}
          interactive={interactive}
          onSelect={shared.onSelect}
          onMouseDown={(e) => interaction.handleManualMouseDown(shape, e)}
          setNodeRef={shared.setNodeRef}
        />
      )
    case 'text':
      return <TextShape shape={shape} {...shared} />
    case 'guide':
      return <GuideShape shape={shape} viewBounds={viewBounds} {...shared} />
    case 'dimension':
      return (
        <DimensionShape
          shape={shape}
          selected={selected}
          interactive={interactive}
          onSelect={shared.onSelect}
          onMouseDown={(e) => interaction.handleManualMouseDown(shape, e)}
          setNodeRef={shared.setNodeRef}
        />
      )
    default:
      return null
  }
}
