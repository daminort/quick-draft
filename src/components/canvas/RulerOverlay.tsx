import { Group, Line, Rect, Text } from 'react-konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import type { RulerState } from '~/components/canvas/tools/useRulerTool'
import { formatDimensionLabel, DIMENSION_LABEL_FONT_SIZE } from '~/lib/dimension'
import { rulerDirection, rulerEndpoint, internalToRealLength } from '~/lib/ruler'

const RULER_COLOR = '#0f766e'
const RULER_DASH = [6, 4]
const RULER_STROKE_WIDTH = 1
const LABEL_GAP = 8
const LABEL_PADDING = 4
const OVERRIDE_BG = '#0f766e'
const OVERRIDE_TEXT_COLOR = '#ffffff'
const CHAR_WIDTH_RATIO = 0.62

interface RulerOverlayProps {
  ruler: RulerState
  scale: number
}

export function RulerOverlay({ ruler, scale }: RulerOverlayProps) {
  const documentScale = useDocumentStore((state) => state.document.scale)
  const documentUnits = useDocumentStore((state) => state.document.units)

  const direction = rulerDirection(ruler.start, ruler.point, ruler.shiftLocked)
  const internalLength = Math.hypot(ruler.point.x - ruler.start.x, ruler.point.y - ruler.start.y)
  const end =
    ruler.lengthOverride !== null
      ? ruler.point
      : rulerEndpoint(ruler.start, direction, internalLength)

  const isEditing = ruler.lengthOverride !== null
  const labelText = isEditing
    ? `${ruler.lengthOverride}|`
    : formatDimensionLabel(internalToRealLength(internalLength, documentScale), documentUnits, true)

  const midpoint = { x: (ruler.start.x + end.x) / 2, y: (ruler.start.y + end.y) / 2 }
  const normal = { x: -direction.y, y: direction.x }
  const labelWidth = labelText.length * DIMENSION_LABEL_FONT_SIZE * CHAR_WIDTH_RATIO

  return (
    <Group listening={false}>
      <Line
        points={[ruler.start.x, ruler.start.y, end.x, end.y]}
        stroke={RULER_COLOR}
        strokeWidth={RULER_STROKE_WIDTH / scale}
        dash={[RULER_DASH[0] / scale, RULER_DASH[1] / scale]}
      />
      {isEditing && (
        <Rect
          x={midpoint.x + normal.x * LABEL_GAP - labelWidth / 2 - LABEL_PADDING}
          y={midpoint.y + normal.y * LABEL_GAP - DIMENSION_LABEL_FONT_SIZE / 2 - LABEL_PADDING}
          width={labelWidth + LABEL_PADDING * 2}
          height={DIMENSION_LABEL_FONT_SIZE + LABEL_PADDING * 2}
          fill={OVERRIDE_BG}
          cornerRadius={3}
        />
      )}
      <Text
        x={midpoint.x + normal.x * LABEL_GAP - labelWidth / 2}
        y={midpoint.y + normal.y * LABEL_GAP - DIMENSION_LABEL_FONT_SIZE / 2}
        text={labelText}
        fontSize={DIMENSION_LABEL_FONT_SIZE}
        fill={isEditing ? OVERRIDE_TEXT_COLOR : RULER_COLOR}
      />
    </Group>
  )
}
