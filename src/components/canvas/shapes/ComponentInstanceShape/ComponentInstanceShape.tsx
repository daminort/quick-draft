import { Group } from 'react-konva';

import { LARGE_VIEW_BOUNDS as INNER_VIEW_BOUNDS } from '~/constants/componentLibrary';

import { documentStore, documentSelectors } from '~/stores/documentStore';

import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer';
import { noopShapeInteraction } from '~/components/canvas/shapes/ShapeInteraction';

import type { TComponentInstanceShapeProps } from './ComponentInstanceShape.props';
import type Konva from 'konva';

const ComponentInstanceShape = ({
  shape,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TComponentInstanceShapeProps) => {
  const componentDef = documentStore(documentSelectors.getComponentById(shape.componentId));
  if (!componentDef) {
    return null;
  }

  const onNodeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target);
  const onNodeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target);

  return (
    <Group
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      scaleX={shape.flipX ? -shape.scale : shape.scale}
      scaleY={shape.flipY ? -shape.scale : shape.scale}
      rotation={shape.rotation}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onNodeDragMove}
      onDragEnd={onNodeDragEnd}
    >
      {componentDef.shapes.map(childShape => (
        <ShapeRenderer
          key={childShape.id}
          shape={childShape}
          isInteractive={false}
          interaction={noopShapeInteraction}
          viewBounds={INNER_VIEW_BOUNDS}
          isSelected={isSelected}
        />
      ))}
    </Group>
  );
};

export { ComponentInstanceShape };
