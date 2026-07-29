import type { TComponentDef, TShape } from '~/types/document';

import { GUIDE_SPAN, TEXT_CHAR_WIDTH_RATIO } from '~/constants/shapes';

export type TBounds = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export function rotatePoint(
  point: { x: number; y: number },
  origin: { x: number; y: number },
  angleDeg: number,
) {
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return { x: origin.x + dx * cos - dy * sin, y: origin.y + dx * sin + dy * cos };
}

/** Union of all shapes' bounds, used to place a new component's local anchor / preview scale. */
export function getUnionBounds(
  shapes: TShape[],
  components: Record<string, TComponentDef> = {},
): TBounds | null {
  let union: TBounds | null = null;
  for (const shape of shapes) {
    const bounds = getShapeBounds(shape, components);
    if (!bounds) {
      continue;
    }
    union = union
      ? {
          x1: Math.min(union.x1, bounds.x1),
          y1: Math.min(union.y1, bounds.y1),
          x2: Math.max(union.x2, bounds.x2),
          y2: Math.max(union.y2, bounds.y2),
        }
      : bounds;
  }
  return union;
}

/** Axis-aligned bounding box for a shape, used for marquee-selection hit testing. */
export function getShapeBounds(
  shape: TShape,
  components: Record<string, TComponentDef> = {},
): TBounds | null {
  switch (shape.type) {
    case 'line':
      return {
        x1: Math.min(shape.x1, shape.x2),
        y1: Math.min(shape.y1, shape.y2),
        x2: Math.max(shape.x1, shape.x2),
        y2: Math.max(shape.y1, shape.y2),
      };
    case 'rect': {
      const origin = { x: shape.x, y: shape.y };
      const corners = [
        { x: 0, y: 0 },
        { x: shape.w, y: 0 },
        { x: shape.w, y: shape.h },
        { x: 0, y: shape.h },
      ].map(c => rotatePoint({ x: shape.x + c.x, y: shape.y + c.y }, origin, shape.rotation));
      const xs = corners.map(c => c.x);
      const ys = corners.map(c => c.y);
      return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
    }
    case 'circle':
    case 'arc':
      return {
        x1: shape.cx - shape.r,
        y1: shape.cy - shape.r,
        x2: shape.cx + shape.r,
        y2: shape.cy + shape.r,
      };
    case 'text': {
      const width = shape.text.length * shape.fontSize * TEXT_CHAR_WIDTH_RATIO;
      return { x1: shape.x, y1: shape.y, x2: shape.x + width, y2: shape.y + shape.fontSize };
    }
    case 'dimension': {
      const isVertical = shape.axis === 'vertical';
      const lineCoordinate = isVertical ? shape.x2 + shape.offset : shape.y2 + shape.offset;
      return isVertical
        ? {
            x1: Math.min(shape.x1, shape.x2, lineCoordinate),
            y1: Math.min(shape.y1, shape.y2),
            x2: Math.max(shape.x1, shape.x2, lineCoordinate),
            y2: Math.max(shape.y1, shape.y2),
          }
        : {
            x1: Math.min(shape.x1, shape.x2),
            y1: Math.min(shape.y1, shape.y2, lineCoordinate),
            x2: Math.max(shape.x1, shape.x2),
            y2: Math.max(shape.y1, shape.y2, lineCoordinate),
          };
    }
    case 'guide':
      if (shape.orientation === 'v') {
        return { x1: shape.position, y1: -GUIDE_SPAN, x2: shape.position, y2: GUIDE_SPAN };
      }
      if (shape.orientation === 'h') {
        return { x1: -GUIDE_SPAN, y1: shape.position, x2: GUIDE_SPAN, y2: shape.position };
      }
      return null;
    case 'component-instance': {
      const def = components[shape.componentId];
      if (!def) {
        return null;
      }
      const localBounds = getUnionBounds(def.shapes, components);
      if (!localBounds) {
        return null;
      }
      const corners = [
        { x: localBounds.x1, y: localBounds.y1 },
        { x: localBounds.x2, y: localBounds.y1 },
        { x: localBounds.x2, y: localBounds.y2 },
        { x: localBounds.x1, y: localBounds.y2 },
      ].map(c => {
        const scaled = { x: c.x * shape.scale, y: c.y * shape.scale };
        const rotated = rotatePoint(scaled, { x: 0, y: 0 }, shape.rotation);
        return { x: rotated.x + shape.x, y: rotated.y + shape.y };
      });
      const xs = corners.map(c => c.x);
      const ys = corners.map(c => c.y);
      return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
    }
    default:
      return null;
  }
}

export function areBoundsIntersecting(a: TBounds, b: TBounds): boolean {
  return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1;
}

export type TSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** Straight edges of a shape, used to detect when a dimension's extension line runs along one of
 * them and would just double the shape's own outline. Curved shapes (circle, arc) have no straight
 * edges to coincide with, so they contribute none. */
export function listShapeEdges(shape: TShape): TSegment[] {
  switch (shape.type) {
    case 'line':
      return [{ x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 }];
    case 'rect': {
      const origin = { x: shape.x, y: shape.y };
      const corners = [
        { x: 0, y: 0 },
        { x: shape.w, y: 0 },
        { x: shape.w, y: shape.h },
        { x: 0, y: shape.h },
      ].map(c => rotatePoint({ x: shape.x + c.x, y: shape.y + c.y }, origin, shape.rotation));
      return corners.map((corner, i) => {
        const next = corners[(i + 1) % corners.length];
        return { x1: corner.x, y1: corner.y, x2: next.x, y2: next.y };
      });
    }
    default:
      return [];
  }
}
