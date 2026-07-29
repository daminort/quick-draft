import { Path } from 'react-konva';

import type { Shape } from '~/types/document';

import { SELECTED_COLOR } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import { computeArcPath } from '~/lib/arcPath';

import type Konva from 'konva';

interface ArcShapeProps {
  shape: Extract<Shape, { type: 'arc' }>;
  interactive: boolean;
  selected?: boolean;
  onSelect: () => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  setNodeRef: (node: Konva.Path | null) => void;
}

export function ArcShape({
  shape,
  interactive,
  selected = false,
  onSelect,
  onMouseDown,
  setNodeRef,
}: ArcShapeProps) {
  return (
    <Path
      ref={setNodeRef}
      id={shape.id}
      x={0}
      y={0}
      data={computeArcPath(shape.cx, shape.cy, shape.r, shape.startAngle, shape.endAngle)}
      stroke={selected ? SELECTED_COLOR : shape.style.stroke}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
      opacity={shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : 1}
      perfectDrawEnabled={false}
      dash={shape.style.dash}
      hitStrokeWidth={HIT_STROKE_WIDTH}
      onClick={onSelect}
      onTap={onSelect}
      onMouseDown={interactive ? onMouseDown : undefined}
    />
  );
}
