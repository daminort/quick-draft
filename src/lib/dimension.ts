type LengthUnit = 'mm' | 'cm' | 'm'
type Point = { x: number; y: number }
export type DimensionAxis = 'horizontal' | 'vertical'

export interface DimensionGeometry {
  /** Main dimension line, rendered with arrowheads on both ends. */
  arrowLine: { x1: number; y1: number; x2: number; y2: number }
  extensionA: { x1: number; y1: number; x2: number; y2: number }
  extensionB: { x1: number; y1: number; x2: number; y2: number }
  label: {
    x: number
    y: number
    width: number
    /** Horizontal anchor: which edge of the text sits at `x` — 'start' grows right, 'end' grows left. */
    align: 'start' | 'center' | 'end'
    /** Vertical anchor: which edge of the text sits at `y`. */
    baseline: 'top' | 'bottom'
  }
  /** Short connector drawn when the label had to be moved outside the dimension line. */
  leader: { x1: number; y1: number; x2: number; y2: number } | null
  length: number
}

export const DIMENSION_LABEL_FONT_SIZE = 12

const UNIT_TO_MM: Record<LengthUnit, number> = { mm: 1, cm: 10, m: 1000 }
const EXTENSION_GAP = 5
const EXTENSION_OVERSHOOT = 5
const LABEL_GAP_HORIZONTAL = 10
const LABEL_GAP_VERTICAL = 10
const LEADER_GAP = 4
const TEXT_PADDING = 6
const CHAR_WIDTH_RATIO = 0.62

export function convertLength(
  internalDistance: number,
  documentScale: number,
  fromUnit: LengthUnit,
  toUnit: LengthUnit,
): number {
  const realLength = internalDistance * documentScale
  const lengthInMm = realLength * UNIT_TO_MM[fromUnit]
  return lengthInMm / UNIT_TO_MM[toUnit]
}

export function formatLength(length: number): string {
  return (Math.round(length * 100) / 100).toString()
}

/**
 * Extension line from a measured point out to the dimension line's coordinate along one axis
 * (x for a vertical dimension line, y for a horizontal one). Starts a small gap away from the
 * point and overshoots the dimension line slightly, per standard drafting convention.
 */
function extensionSegment(
  point: Point,
  lineCoordinate: number,
  alongX: boolean,
): { x1: number; y1: number; x2: number; y2: number } {
  const pointCoord = alongX ? point.x : point.y
  const direction = Math.sign(lineCoordinate - pointCoord) || 1
  const gapCoord = pointCoord + direction * EXTENSION_GAP
  const overshootCoord = lineCoordinate + direction * EXTENSION_OVERSHOOT

  return alongX
    ? { x1: gapCoord, y1: point.y, x2: overshootCoord, y2: point.y }
    : { x1: point.x, y1: gapCoord, x2: point.x, y2: overshootCoord }
}

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CHAR_WIDTH_RATIO
}

function buildLabelAndLeader(
  a: Point,
  b: Point,
  normal: Point,
  axis: DimensionAxis,
  labelGap: number,
  labelText: string,
  fontSize: number,
): { label: DimensionGeometry['label']; leader: DimensionGeometry['leader'] } {
  const lineLength = Math.hypot(b.x - a.x, b.y - a.y)
  const direction =
    lineLength === 0 ? { x: 1, y: 0 } : { x: (b.x - a.x) / lineLength, y: (b.y - a.y) / lineLength }
  const textWidth = estimateTextWidth(labelText, fontSize)
  const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }

  // Anchor the text so it always grows away from the dimension line, never back across it:
  // for a vertical dimension the label sits beside the line (left or right of it) and must be
  // aligned accordingly; for a horizontal one it stays centered above/below, where the growth
  // direction doesn't matter.
  const align: DimensionGeometry['label']['align'] =
    axis === 'vertical' ? (normal.x >= 0 ? 'start' : 'end') : 'center'
  const baseline: DimensionGeometry['label']['baseline'] =
    axis === 'horizontal' && normal.y >= 0 ? 'top' : 'bottom'

  if (lineLength >= textWidth + TEXT_PADDING) {
    return {
      label: {
        x: midpoint.x + normal.x * labelGap,
        y: midpoint.y + normal.y * labelGap,
        width: textWidth,
        align,
        baseline,
      },
      leader: null,
    }
  }

  const anchor = {
    x: b.x + direction.x * (textWidth / 2 + LEADER_GAP),
    y: b.y + direction.y * (textWidth / 2 + LEADER_GAP),
  }

  return {
    label: {
      x: anchor.x + normal.x * labelGap,
      y: anchor.y + normal.y * labelGap,
      width: textWidth,
      align,
      baseline,
    },
    leader: { x1: b.x, y1: b.y, x2: anchor.x, y2: anchor.y },
  }
}

export function formatDimensionLabel(
  length: number,
  dimensionUnit: LengthUnit,
  showUnit: boolean,
): string {
  return showUnit ? `${formatLength(length)} ${dimensionUnit}` : formatLength(length)
}

export function computeDimensionGeometry(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  axis: DimensionAxis,
  offset: number,
  documentScale: number,
  documentUnits: LengthUnit,
  dimensionUnit: LengthUnit,
  showUnit: boolean,
  fontSize: number = DIMENSION_LABEL_FONT_SIZE,
): DimensionGeometry | null {
  const isVertical = axis === 'vertical'
  const refLength = isVertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1)
  if (refLength === 0) return null

  const lineCoordinate = isVertical ? x2 + offset : y2 + offset
  const lineA: Point = isVertical ? { x: lineCoordinate, y: y1 } : { x: x1, y: lineCoordinate }
  const lineB: Point = isVertical ? { x: lineCoordinate, y: y2 } : { x: x2, y: lineCoordinate }
  // Label offset direction follows which side the extension lines start from, continuing
  // outward past the dimension line: right of the line when the points sit to its left
  // (offset > 0) and vice versa for vertical dimensions; below the line when the points sit
  // above it (offset > 0) and vice versa for horizontal ones.
  const sign = Math.sign(offset) || -1
  const normal: Point = isVertical ? { x: sign, y: 0 } : { x: 0, y: sign }

  const length = convertLength(refLength, documentScale, documentUnits, dimensionUnit)
  const { label, leader } = buildLabelAndLeader(
    lineA,
    lineB,
    normal,
    axis,
    isVertical ? LABEL_GAP_VERTICAL : LABEL_GAP_HORIZONTAL,
    formatDimensionLabel(length, dimensionUnit, showUnit),
    fontSize,
  )

  return {
    arrowLine: { x1: lineA.x, y1: lineA.y, x2: lineB.x, y2: lineB.y },
    extensionA: extensionSegment({ x: x1, y: y1 }, lineCoordinate, isVertical),
    extensionB: extensionSegment({ x: x2, y: y2 }, lineCoordinate, isVertical),
    label,
    leader,
    length,
  }
}
