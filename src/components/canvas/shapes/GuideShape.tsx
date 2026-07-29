import { Line } from 'react-konva';

import type { Shape } from '~/types/document';

import { SELECTED_COLOR, GUIDE_COLOR, GUIDE_DASH, GUIDE_REACH } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import type { ViewBounds } from '~/components/canvas/shapes/ShapeInteraction';

import type Konva from 'konva';

interface GuideShapeProps {
  shape: Extract<Shape, { type: 'guide' }>;
  viewBounds: ViewBounds;
  draggable: boolean;
  selected?: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Line | null) => void;
}

export function GuideShape({
  shape,
  viewBounds,
  draggable,
  selected = false,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: GuideShapeProps) {
  const common = {
    ref: setNodeRef,
    id: shape.id,
    stroke: selected ? SELECTED_COLOR : GUIDE_COLOR,
    strokeWidth: 1,
    dash: GUIDE_DASH,
    hitStrokeWidth: HIT_STROKE_WIDTH,
    listening: draggable,
    draggable,
    onClick: onSelect,
    onTap: onSelect,
    onDragStart,
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e.target),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e.target),
  };

  if (shape.orientation === 'v') {
    return (
      <Line
        {...common}
        x={shape.position}
        y={0}
        points={[0, viewBounds.top, 0, viewBounds.bottom]}
        dragBoundFunc={pos => ({ x: pos.x, y: 0 })}
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
        dragBoundFunc={pos => ({ x: 0, y: pos.y })}
      />
    );
  }

  return (
    <Line
      {...common}
      x={0}
      y={shape.position}
      points={[viewBounds.left, 0, viewBounds.right, 0]}
      dragBoundFunc={pos => ({ x: 0, y: pos.y })}
    />
  );
}
