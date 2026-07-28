import type Konva from 'konva'
import type { Shape } from '~/types/document'
import type { ShapeInteraction, ViewBounds } from '~/components/canvas/shapes/ShapeInteraction'
import { LineShape } from '~/components/canvas/shapes/LineShape'
import { RectShape } from '~/components/canvas/shapes/RectShape'
import { CircleShape } from '~/components/canvas/shapes/CircleShape'
import { ArcShape } from '~/components/canvas/shapes/ArcShape'
import { TextShape } from '~/components/canvas/shapes/TextShape'
import { GuideShape } from '~/components/canvas/shapes/GuideShape'
import { DimensionShape } from '~/components/canvas/shapes/DimensionShape'
import { ComponentInstanceShape } from '~/components/canvas/shapes/ComponentInstanceShape'

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
    selected,
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
          selected={selected}
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
    case 'component-instance':
      return <ComponentInstanceShape shape={shape} {...shared} />
    default:
      return null
  }
}
