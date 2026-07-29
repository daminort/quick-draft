import { Group, Line, Arrow, Text } from 'react-konva'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useUIStore } from '~/stores/useUIStore'
import type { Shape } from '~/types/document'
import { computeDimensionGeometry, formatDimensionLabel } from '~/lib/dimension'
import {
  DIMENSION_LABEL_FONT_SIZE,
  DIMENSION_STROKE_WIDTH,
  ARROW_SIZE,
} from '~/constants/dimension'
import { SELECTED_COLOR } from '~/constants/shapes'
import { HIT_STROKE_WIDTH } from '~/constants/canvas'

interface DimensionShapeProps {
  shape: Extract<Shape, { type: 'dimension' }>
  selected?: boolean
  interactive: boolean
  onSelect: () => void
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  setNodeRef: (node: Konva.Group | null) => void
}

export function DimensionShape({
  shape,
  selected = false,
  interactive,
  onSelect,
  onMouseDown,
  setNodeRef,
}: DimensionShapeProps) {
  const documentScale = useDocumentStore((state) => state.document.scale)
  const documentUnits = useDocumentStore((state) => state.document.units)
  const shapes = useDocumentStore((state) => state.document.shapes)
  const showUnit = useUIStore((state) => state.showDimensionUnit)
  const dimensionColor = useUIStore((state) => state.dimensionColor)
  const color = selected ? SELECTED_COLOR : dimensionColor

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
    showUnit,
    shapes,
  )
  if (!geometry) return null

  return (
    <Group
      ref={setNodeRef}
      id={shape.id}
      x={0}
      y={0}
      onClick={onSelect}
      onTap={onSelect}
      onMouseDown={interactive ? onMouseDown : undefined}
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
        text={formatDimensionLabel(geometry.length, shape.unit, showUnit)}
        fontSize={DIMENSION_LABEL_FONT_SIZE}
        fontStyle="italic"
        fill={color}
        offsetX={
          geometry.label.align === 'center'
            ? geometry.label.width / 2
            : geometry.label.align === 'end'
              ? geometry.label.width
              : 0
        }
        offsetY={geometry.label.baseline === 'bottom' ? DIMENSION_LABEL_FONT_SIZE : 0}
      />
    </Group>
  )
}
