import { Group } from 'react-konva';

import type { TShape } from '~/types/document';

import { LARGE_VIEW_BOUNDS as INNER_VIEW_BOUNDS } from '~/constants/componentLibrary';

import { useDocumentStore } from '~/stores/useDocumentStore';

import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer';
import { noopShapeInteraction } from '~/components/canvas/shapes/ShapeInteraction';

import type Konva from 'konva';

type TComponentInstanceShapeProps = {
  shape: Extract<TShape, { type: 'component-instance' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Group | null) => void;
};

export function ComponentInstanceShape({
  shape,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TComponentInstanceShapeProps) {
  const componentDef = useDocumentStore(state => state.document.components[shape.componentId]);
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
      scaleX={shape.scale}
      scaleY={shape.scale}
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
}
