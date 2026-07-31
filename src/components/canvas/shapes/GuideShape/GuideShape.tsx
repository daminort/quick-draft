import { Line } from 'react-konva';

import { SELECTED_COLOR, GUIDE_COLOR, GUIDE_DASH, GUIDE_REACH } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import type { TGuideShapeProps } from './GuideShape.props';
import type Konva from 'konva';

function GuideShape({
  shape,
  viewBounds,
  isDraggable,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TGuideShapeProps) {
  const strokeColor = isSelected ? SELECTED_COLOR : GUIDE_COLOR;
  const onNodeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target);
  const onNodeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target);
  const restrictDragToHorizontal = (pos: Konva.Vector2d): Konva.Vector2d => ({ x: pos.x, y: 0 });
  const restrictDragToVertical = (pos: Konva.Vector2d): Konva.Vector2d => ({ x: 0, y: pos.y });
  const common = {
    ref: setNodeRef,
    id: shape.id,
    stroke: strokeColor,
    strokeWidth: 1,
    dash: GUIDE_DASH,
    hitStrokeWidth: HIT_STROKE_WIDTH,
    listening: isDraggable,
    draggable: isDraggable,
    onClick: onSelect,
    onTap: onSelect,
    onDragStart,
    onDragMove: onNodeDragMove,
    onDragEnd: onNodeDragEnd,
  };

  if (shape.orientation === 'v') {
    return (
      <Line
        {...common}
        x={shape.position}
        y={0}
        points={[0, viewBounds.top, 0, viewBounds.bottom]}
        dragBoundFunc={restrictDragToHorizontal}
      />
    );
  }

  if (shape.orientation === 'angle') {
    const angleRad = ((shape.angle ?? 0) * Math.PI) / 180;
    const dx = Math.cos(angleRad) * GUIDE_REACH;
    const dy = Math.sin(angleRad) * GUIDE_REACH;
    return (
      <Line
        {...common}
        x={0}
        y={shape.position}
        points={[-dx, -dy, dx, dy]}
        dragBoundFunc={restrictDragToVertical}
      />
    );
  }

  return (
    <Line
      {...common}
      x={0}
      y={shape.position}
      points={[viewBounds.left, 0, viewBounds.right, 0]}
      dragBoundFunc={restrictDragToVertical}
    />
  );
}

export { GuideShape };
