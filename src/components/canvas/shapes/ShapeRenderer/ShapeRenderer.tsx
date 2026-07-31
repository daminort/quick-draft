import { LineShape } from '~/components/canvas/shapes/LineShape';
import { RectShape } from '~/components/canvas/shapes/RectShape';
import { CircleShape } from '~/components/canvas/shapes/CircleShape';
import { ArcShape } from '~/components/canvas/shapes/ArcShape';
import { TextShape } from '~/components/canvas/shapes/TextShape';
import { GuideShape } from '~/components/canvas/shapes/GuideShape';
import { DimensionShape } from '~/components/canvas/shapes/DimensionShape';
import { ComponentInstanceShape } from '~/components/canvas/shapes/ComponentInstanceShape';

import type { TShapeRendererProps } from './ShapeRenderer.props';
import type Konva from 'konva';

const ShapeRenderer = ({
  shape,
  isInteractive,
  interaction,
  viewBounds,
  isSelected = false,
  editingTextId = null,
  onStartEditText,
}: TShapeRendererProps) => {
  const onSelect = isInteractive ? () => interaction.selectShape(shape.id) : () => {};
  const onDragStart = () => interaction.onDragStart(shape);
  const onDragMove = (node: Konva.Node) => interaction.onDragMove(shape, node);
  const onDragEnd = (node: Konva.Node) => interaction.onDragEnd(shape, node);
  const setNodeRef = (node: Konva.Node | null) => interaction.registerNode(shape.id, node);
  const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
    interaction.onManualMouseDown(shape, e);
  const onDblClick = isInteractive ? () => onStartEditText?.(shape.id) : undefined;

  const shared = {
    isDraggable: isInteractive,
    isSelected,
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    setNodeRef,
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
          setNodeRef={setNodeRef}
          shape={shape}
          isInteractive={isInteractive}
          isSelected={isSelected}
          onSelect={onSelect}
          onMouseDown={onMouseDown}
        />
      );
    case 'text':
      return (
        <TextShape
          shape={shape}
          {...shared}
          isVisible={editingTextId !== shape.id}
          onDblClick={onDblClick}
        />
      );
    case 'guide':
      return <GuideShape shape={shape} viewBounds={viewBounds} {...shared} />;
    case 'dimension':
      return (
        <DimensionShape
          setNodeRef={setNodeRef}
          shape={shape}
          isSelected={isSelected}
          isInteractive={isInteractive}
          onSelect={onSelect}
          onMouseDown={onMouseDown}
        />
      );
    case 'component-instance':
      return <ComponentInstanceShape shape={shape} {...shared} />;
    default:
      return null;
  }
};

export { ShapeRenderer };
