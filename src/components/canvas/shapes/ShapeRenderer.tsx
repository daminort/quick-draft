import type { TShape, TShapeId } from '~/types/document';

import type { TShapeInteraction, TViewBounds } from '~/components/canvas/shapes/ShapeInteraction';
import { LineShape } from '~/components/canvas/shapes/LineShape';
import { RectShape } from '~/components/canvas/shapes/RectShape';
import { CircleShape } from '~/components/canvas/shapes/CircleShape';
import { ArcShape } from '~/components/canvas/shapes/ArcShape';
import { TextShape } from '~/components/canvas/shapes/TextShape';
import { GuideShape } from '~/components/canvas/shapes/GuideShape';
import { DimensionShape } from '~/components/canvas/shapes/DimensionShape';
import { ComponentInstanceShape } from '~/components/canvas/shapes/ComponentInstanceShape';

import type Konva from 'konva';

type TShapeRendererProps = {
  shape: TShape;
  isInteractive: boolean;
  interaction: TShapeInteraction;
  viewBounds: TViewBounds;
  isSelected?: boolean;
  editingTextId?: TShapeId | null;
  onStartEditText?: (id: TShapeId) => void;
};

export function ShapeRenderer({
  shape,
  isInteractive,
  interaction,
  viewBounds,
  isSelected = false,
  editingTextId = null,
  onStartEditText,
}: TShapeRendererProps) {
  const shared = {
    isDraggable: isInteractive,
    isSelected,
    onSelect: isInteractive ? () => interaction.selectShape(shape.id) : () => {},
    onDragStart: () => interaction.onDragStart(shape),
    onDragMove: (node: Konva.Node) => interaction.onDragMove(shape, node),
    onDragEnd: (node: Konva.Node) => interaction.onDragEnd(shape, node),
    setNodeRef: (node: Konva.Node | null) => interaction.registerNode(shape.id, node),
  };

  switch (shape.type) {
    case 'line':
      return <LineShape shape={shape} {...shared} />;
    case 'rect':
      return <RectShape shape={shape} {...shared} />;
    case 'circle':
      return <CircleShape shape={shape} {...shared} />;
    case 'arc':
      return (
        <ArcShape
          shape={shape}
          isInteractive={isInteractive}
          isSelected={isSelected}
          onSelect={shared.onSelect}
          onMouseDown={e => interaction.onManualMouseDown(shape, e)}
          setNodeRef={shared.setNodeRef}
        />
      );
    case 'text':
      return (
        <TextShape
          shape={shape}
          {...shared}
          isVisible={editingTextId !== shape.id}
          onDblClick={isInteractive ? () => onStartEditText?.(shape.id) : undefined}
        />
      );
    case 'guide':
      return <GuideShape shape={shape} viewBounds={viewBounds} {...shared} />;
    case 'dimension':
      return (
        <DimensionShape
          shape={shape}
          isSelected={isSelected}
          isInteractive={isInteractive}
          onSelect={shared.onSelect}
          onMouseDown={e => interaction.onManualMouseDown(shape, e)}
          setNodeRef={shared.setNodeRef}
        />
      );
    case 'component-instance':
      return <ComponentInstanceShape shape={shape} {...shared} />;
    default:
      return null;
  }
}
