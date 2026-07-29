import { Path } from 'react-konva';

import type { TShape } from '~/types/document';

import { SELECTED_COLOR } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import { computeArcPath } from '~/lib/arcPath';

import type Konva from 'konva';

type TArcShapeProps = {
  shape: Extract<TShape, { type: 'arc' }>;
  isInteractive: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  setNodeRef: (node: Konva.Path | null) => void;
};

export function ArcShape({
  shape,
  isInteractive,
  isSelected = false,
  onSelect,
  onMouseDown,
  setNodeRef,
}: TArcShapeProps) {
  const pathData = computeArcPath(shape.cx, shape.cy, shape.r, shape.startAngle, shape.endAngle);
  const strokeColor = isSelected ? SELECTED_COLOR : shape.style.stroke;
  const fillOpacity = shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : 1;
  const onManualMouseDown = isInteractive ? onMouseDown : undefined;

  return (
    <Path
      ref={setNodeRef}
      id={shape.id}
      x={0}
      y={0}
      data={pathData}
      onClick={onSelect}
      onTap={onSelect}
      onMouseDown={onManualMouseDown}
      stroke={strokeColor}
      strokeWidth={shape.style.strokeWidth}
      fill={shape.style.fill}
      opacity={fillOpacity}
      perfectDrawEnabled={false}
      dash={shape.style.dash}
      hitStrokeWidth={HIT_STROKE_WIDTH}
    />
  );
}
