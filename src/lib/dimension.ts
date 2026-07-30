import type { TShape } from '~/types/document';

import {
  DIMENSION_LABEL_FONT_SIZE,
  UNIT_TO_MM,
  EXTENSION_GAP,
  EXTENSION_OVERSHOOT,
  LABEL_GAP_HORIZONTAL,
  LABEL_GAP_VERTICAL,
  LEADER_GAP,
  TEXT_PADDING,
  DIMENSION_TEXT_CHAR_WIDTH_RATIO,
  EDGE_EPSILON,
} from '~/constants/dimension';

import { listShapeEdges, type TSegment } from '~/lib/bounds';

type TLengthUnit = 'mm' | 'cm' | 'm';
type TPoint = { x: number; y: number };
export type TDimensionAxis = 'horizontal' | 'vertical';

export type TDimensionGeometry = {
  arrowLine: { x1: number; y1: number; x2: number; y2: number };
  /** Null when the extension line would run entirely along a shape's own edge — drawing it there
   * would just double that edge's outline. */
  extensionA: TSegment | null;
  extensionB: TSegment | null;
  label: {
    x: number;
    y: number;
    width: number;
    /** Horizontal anchor: which edge of the text sits at `x` — 'start' grows right, 'end' grows left. */
    align: 'start' | 'center' | 'end';
    /** Vertical anchor: which edge of the text sits at `y`. */
    baseline: 'top' | 'bottom';
  };
  /** Short connector drawn when the label had to be moved outside the dimension line. */
  leader: { x1: number; y1: number; x2: number; y2: number } | null;
  length: number;
};

export function convertLength(
  internalDistance: number,
  documentScale: number,
  fromUnit: TLengthUnit,
  toUnit: TLengthUnit,
): number {
  const realLength = internalDistance * documentScale;
  const lengthInMm = realLength * UNIT_TO_MM[fromUnit];
  return lengthInMm / UNIT_TO_MM[toUnit];
}

export function formatLength(length: number): string {
  return (Math.round(length * 100) / 100).toString();
}

/**
 * Extension line from a measured point out to the dimension line's coordinate along one axis
 * (x for a vertical dimension line, y for a horizontal one). Starts a small gap away from the
 * point and overshoots the dimension line slightly, per standard drafting convention.
 */
function extensionSegment(
  point: TPoint,
  lineCoordinate: number,
  isAlongX: boolean,
): { x1: number; y1: number; x2: number; y2: number } {
  const pointCoord = isAlongX ? point.x : point.y;
  const direction = Math.sign(lineCoordinate - pointCoord) || 1;
  const gapCoord = pointCoord + direction * EXTENSION_GAP;
  const overshootCoord = lineCoordinate + direction * EXTENSION_OVERSHOOT;

  return isAlongX
    ? { x1: gapCoord, y1: point.y, x2: overshootCoord, y2: point.y }
    : { x1: point.x, y1: gapCoord, x2: point.x, y2: overshootCoord };
}

/** Whether `point` sits on the (finite) `segment`, checked as perpendicular distance to the
 * infinite line plus a bounding-box containment test — exact for collinear points. */
function isPointOnSegment(point: TPoint, segment: TSegment, epsilon: number): boolean {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    return Math.hypot(point.x - segment.x1, point.y - segment.y1) <= epsilon;
  }
  const cross = dx * (point.y - segment.y1) - dy * (point.x - segment.x1);
  if (Math.abs(cross) / Math.sqrt(lengthSq) > epsilon) {
    return false;
  }
  return (
    point.x >= Math.min(segment.x1, segment.x2) - epsilon &&
    point.x <= Math.max(segment.x1, segment.x2) + epsilon &&
    point.y >= Math.min(segment.y1, segment.y2) - epsilon &&
    point.y <= Math.max(segment.y1, segment.y2) + epsilon
  );
}

/** True when `segment` (an extension line) lies entirely on one of `edges` (a shape's straight
 * sides), making it redundant to draw since the shape's own outline already marks that line. */
function isSegmentOnAnyEdge(segment: TSegment, edges: TSegment[]): boolean {
  return edges.some(
    edge =>
      isPointOnSegment({ x: segment.x1, y: segment.y1 }, edge, EDGE_EPSILON) &&
      isPointOnSegment({ x: segment.x2, y: segment.y2 }, edge, EDGE_EPSILON),
  );
}

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * DIMENSION_TEXT_CHAR_WIDTH_RATIO;
}

function buildLabelAndLeader(
  a: TPoint,
  b: TPoint,
  normal: TPoint,
  axis: TDimensionAxis,
  labelGap: number,
  labelText: string,
  fontSize: number,
): { label: TDimensionGeometry['label']; leader: TDimensionGeometry['leader'] } {
  const lineLength = Math.hypot(b.x - a.x, b.y - a.y);
  const direction =
    lineLength === 0
      ? { x: 1, y: 0 }
      : { x: (b.x - a.x) / lineLength, y: (b.y - a.y) / lineLength };
  const textWidth = estimateTextWidth(labelText, fontSize);
  const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

  // Anchor the text so it always grows away from the dimension line, never back across it:
  // for a vertical dimension the label sits beside the line (left or right of it) and must be
  // aligned accordingly; for a horizontal one it stays centered above/below, where the growth
  // direction doesn't matter.
  const align: TDimensionGeometry['label']['align'] =
    axis === 'vertical' ? (normal.x >= 0 ? 'start' : 'end') : 'center';
  const baseline: TDimensionGeometry['label']['baseline'] =
    axis === 'horizontal' && normal.y >= 0 ? 'top' : 'bottom';

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
    };
  }

  const anchor = {
    x: b.x + direction.x * (textWidth / 2 + LEADER_GAP),
    y: b.y + direction.y * (textWidth / 2 + LEADER_GAP),
  };

  return {
    label: {
      x: anchor.x + normal.x * labelGap,
      y: anchor.y + normal.y * labelGap,
      width: textWidth,
      align,
      baseline,
    },
    leader: { x1: b.x, y1: b.y, x2: anchor.x, y2: anchor.y },
  };
}

export function formatDimensionLabel(
  length: number,
  dimensionUnit: TLengthUnit,
  shouldShowUnit: boolean,
): string {
  return shouldShowUnit ? `${formatLength(length)} ${dimensionUnit}` : formatLength(length);
}

export function computeDimensionGeometry(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  axis: TDimensionAxis,
  offset: number,
  documentScale: number,
  documentUnits: TLengthUnit,
  dimensionUnit: TLengthUnit,
  shouldShowUnit: boolean,
  shapes: TShape[],
  fontSize: number = DIMENSION_LABEL_FONT_SIZE,
): TDimensionGeometry | null {
  const isVertical = axis === 'vertical';
  const refLength = isVertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1);
  if (refLength === 0) {
    return null;
  }

  const lineCoordinate = isVertical ? x2 + offset : y2 + offset;
  const lineA: TPoint = isVertical ? { x: lineCoordinate, y: y1 } : { x: x1, y: lineCoordinate };
  const lineB: TPoint = isVertical ? { x: lineCoordinate, y: y2 } : { x: x2, y: lineCoordinate };
  // Label offset direction follows which side the extension lines start from, continuing
  // outward past the dimension line: right of the line when the points sit to its left
  // (offset > 0) and vice versa for vertical dimensions; below the line when the points sit
  // above it (offset > 0) and vice versa for horizontal ones.
  const sign = Math.sign(offset) || -1;
  const normal: TPoint = isVertical ? { x: sign, y: 0 } : { x: 0, y: sign };

  const length = convertLength(refLength, documentScale, documentUnits, dimensionUnit);
  const { label, leader } = buildLabelAndLeader(
    lineA,
    lineB,
    normal,
    axis,
    isVertical ? LABEL_GAP_VERTICAL : LABEL_GAP_HORIZONTAL,
    formatDimensionLabel(length, dimensionUnit, shouldShowUnit),
    fontSize,
  );

  const extensionA = extensionSegment({ x: x1, y: y1 }, lineCoordinate, isVertical);
  const extensionB = extensionSegment({ x: x2, y: y2 }, lineCoordinate, isVertical);
  const edges = shapes.flatMap(listShapeEdges);

  return {
    arrowLine: { x1: lineA.x, y1: lineA.y, x2: lineB.x, y2: lineB.y },
    extensionA: isSegmentOnAnyEdge(extensionA, edges) ? null : extensionA,
    extensionB: isSegmentOnAnyEdge(extensionB, edges) ? null : extensionB,
    label,
    leader,
    length,
  };
}
