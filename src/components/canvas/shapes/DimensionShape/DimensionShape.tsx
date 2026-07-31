import { Group, Line, Arrow, Text } from 'react-konva';

import {
  DIMENSION_LABEL_FONT_SIZE,
  DIMENSION_STROKE_WIDTH,
  ARROW_SIZE,
} from '~/constants/dimension';
import { SELECTED_COLOR } from '~/constants/shapes';
import { HIT_STROKE_WIDTH } from '~/constants/canvas';

import { computeDimensionGeometry, formatDimensionLabel } from '~/lib/dimension';

import { uiStore, uiSelectors } from '~/stores/uiStore';
import { documentStore, documentSelectors } from '~/stores/documentStore';

import type { TDimensionShapeProps } from './DimensionShape.props';

function DimensionShape({
  shape,
  isSelected = false,
  isInteractive,
  onSelect,
  onMouseDown,
  setNodeRef,
}: TDimensionShapeProps) {
  const documentScale = documentStore(documentSelectors.getScale);
  const documentUnits = documentStore(documentSelectors.getUnits);
  const shapes = documentStore(documentSelectors.getShapes);
  const shouldShowUnit = uiStore(uiSelectors.getShouldShowDimensionUnit);
  const dimensionColor = uiStore(uiSelectors.getDimensionColor);
  const color = isSelected ? SELECTED_COLOR : dimensionColor;

  const geometry = computeDimensionGeometry(
    shape.x1,
    shape.y1,
    shape.x2,
    shape.y2,
    shape.axis,
    shape.offset,
    documentScale,
    documentUnits,
    shape.unit,
    shouldShowUnit,
    shapes,
  );
  if (!geometry) {
    return null;
  }

  const onManualMouseDown = isInteractive ? onMouseDown : undefined;
  const labelText = formatDimensionLabel(geometry.length, shape.unit, shouldShowUnit);
  const labelOffsetX =
    geometry.label.align === 'center'
      ? geometry.label.width / 2
      : geometry.label.align === 'end'
        ? geometry.label.width
        : 0;
  const labelOffsetY = geometry.label.baseline === 'bottom' ? DIMENSION_LABEL_FONT_SIZE : 0;

  return (
    <Group
      ref={setNodeRef}
      id={shape.id}
      x={0}
      y={0}
      onClick={onSelect}
      onTap={onSelect}
      onMouseDown={onManualMouseDown}
    >
      {geometry.extensionA && (
        <Line
          points={[
            geometry.extensionA.x1,
            geometry.extensionA.y1,
            geometry.extensionA.x2,
            geometry.extensionA.y2,
          ]}
          stroke={color}
          strokeWidth={DIMENSION_STROKE_WIDTH}
          hitStrokeWidth={HIT_STROKE_WIDTH}
        />
      )}
      {geometry.extensionB && (
        <Line
          points={[
            geometry.extensionB.x1,
            geometry.extensionB.y1,
            geometry.extensionB.x2,
            geometry.extensionB.y2,
          ]}
          stroke={color}
          strokeWidth={DIMENSION_STROKE_WIDTH}
          hitStrokeWidth={HIT_STROKE_WIDTH}
        />
      )}
      <Arrow
        points={[
          geometry.arrowLine.x1,
          geometry.arrowLine.y1,
          geometry.arrowLine.x2,
          geometry.arrowLine.y2,
        ]}
        stroke={color}
        fill={color}
        strokeWidth={DIMENSION_STROKE_WIDTH}
        pointerAtBeginning
        pointerAtEnding
        pointerLength={ARROW_SIZE}
        pointerWidth={ARROW_SIZE - 1}
        hitStrokeWidth={HIT_STROKE_WIDTH}
      />
      {geometry.leader && (
        <Line
          points={[geometry.leader.x1, geometry.leader.y1, geometry.leader.x2, geometry.leader.y2]}
          stroke={color}
          strokeWidth={DIMENSION_STROKE_WIDTH}
          hitStrokeWidth={HIT_STROKE_WIDTH}
        />
      )}
      <Text
        x={geometry.label.x}
        y={geometry.label.y}
        text={labelText}
        fontSize={DIMENSION_LABEL_FONT_SIZE}
        fontStyle="italic"
        fill={color}
        offsetX={labelOffsetX}
        offsetY={labelOffsetY}
      />
    </Group>
  );
}

export { DimensionShape };
