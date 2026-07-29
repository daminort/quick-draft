import { Group, Line, Rect, Text } from 'react-konva';

import { DIMENSION_LABEL_FONT_SIZE, DIMENSION_TEXT_CHAR_WIDTH_RATIO } from '~/constants/dimension';
import {
  RULER_OVERLAY_COLOR,
  RULER_OVERLAY_DASH,
  RULER_OVERLAY_STROKE_WIDTH,
  RULER_OVERLAY_LABEL_GAP,
  RULER_OVERLAY_LABEL_PADDING,
  RULER_OVERLAY_BG,
  RULER_OVERLAY_TEXT_COLOR,
} from '~/constants/ruler';

import { formatDimensionLabel } from '~/lib/dimension';
import { rulerDirection, rulerEndpoint, internalToRealLength } from '~/lib/ruler';

import { useDocumentStore } from '~/stores/useDocumentStore';

import type { TRulerState } from '~/components/canvas/tools/useRulerTool';

type TRulerOverlayProps = {
  ruler: TRulerState;
  scale: number;
};

export function RulerOverlay({ ruler, scale }: TRulerOverlayProps) {
  const documentScale = useDocumentStore(state => state.document.scale);
  const documentUnits = useDocumentStore(state => state.document.units);

  const direction = rulerDirection(ruler.start, ruler.point, ruler.isShiftLocked);
  const internalLength = Math.hypot(ruler.point.x - ruler.start.x, ruler.point.y - ruler.start.y);
  const end =
    ruler.lengthOverride !== null
      ? ruler.point
      : rulerEndpoint(ruler.start, direction, internalLength);

  const isEditing = ruler.lengthOverride !== null;
  const labelText = isEditing
    ? `${ruler.lengthOverride}|`
    : formatDimensionLabel(
        internalToRealLength(internalLength, documentScale),
        documentUnits,
        true,
      );

  const midpoint = { x: (ruler.start.x + end.x) / 2, y: (ruler.start.y + end.y) / 2 };
  const normal = { x: -direction.y, y: direction.x };
  const labelWidth = labelText.length * DIMENSION_LABEL_FONT_SIZE * DIMENSION_TEXT_CHAR_WIDTH_RATIO;

  const labelAnchorX = midpoint.x + normal.x * RULER_OVERLAY_LABEL_GAP - labelWidth / 2;
  const labelAnchorY =
    midpoint.y + normal.y * RULER_OVERLAY_LABEL_GAP - DIMENSION_LABEL_FONT_SIZE / 2;
  const labelBackgroundX = labelAnchorX - RULER_OVERLAY_LABEL_PADDING;
  const labelBackgroundY = labelAnchorY - RULER_OVERLAY_LABEL_PADDING;
  const labelBackgroundWidth = labelWidth + RULER_OVERLAY_LABEL_PADDING * 2;
  const labelBackgroundHeight = DIMENSION_LABEL_FONT_SIZE + RULER_OVERLAY_LABEL_PADDING * 2;
  const labelTextColor = isEditing ? RULER_OVERLAY_TEXT_COLOR : RULER_OVERLAY_COLOR;

  return (
    <Group listening={false}>
      <Line
        points={[ruler.start.x, ruler.start.y, end.x, end.y]}
        stroke={RULER_OVERLAY_COLOR}
        strokeWidth={RULER_OVERLAY_STROKE_WIDTH / scale}
        dash={[RULER_OVERLAY_DASH[0] / scale, RULER_OVERLAY_DASH[1] / scale]}
      />
      {isEditing && (
        <Rect
          x={labelBackgroundX}
          y={labelBackgroundY}
          width={labelBackgroundWidth}
          height={labelBackgroundHeight}
          fill={RULER_OVERLAY_BG}
          cornerRadius={3}
        />
      )}
      <Text
        x={labelAnchorX}
        y={labelAnchorY}
        text={labelText}
        fontSize={DIMENSION_LABEL_FONT_SIZE}
        fill={labelTextColor}
      />
    </Group>
  );
}
