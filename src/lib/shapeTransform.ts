import type { TComponentDef, TShape, TShapePatch, TShapePointKey } from '~/types/document';

type TPoint = { x: number; y: number };

/** Used to measure how far a shape moved. */
function getShapeAnchor(shape: TShape): TPoint {
  switch (shape.type) {
    case 'rect':
    case 'text':
    case 'component-instance':
      return { x: shape.x, y: shape.y };
    case 'circle':
    case 'arc':
      return { x: shape.cx, y: shape.cy };
    case 'line':
    case 'dimension':
      return { x: shape.x1, y: shape.y1 };
    case 'guide':
      return shape.orientation === 'v' ? { x: shape.position, y: 0 } : { x: 0, y: shape.position };
    default:
      return { x: 0, y: 0 };
  }
}

/** Patch that rigidly translates a shape by (dx, dy), independent of any snapping. */
function translateShape(shape: TShape, dx: number, dy: number): TShapePatch {
  switch (shape.type) {
    case 'line':
      return { x1: shape.x1 + dx, y1: shape.y1 + dy, x2: shape.x2 + dx, y2: shape.y2 + dy };
    case 'rect':
    case 'text':
    case 'component-instance':
      return { x: shape.x + dx, y: shape.y + dy };
    case 'circle':
      return { cx: shape.cx + dx, cy: shape.cy + dy };
    case 'arc':
      return { cx: shape.cx + dx, cy: shape.cy + dy };
    case 'dimension':
      return { x1: shape.x1 + dx, y1: shape.y1 + dy, x2: shape.x2 + dx, y2: shape.y2 + dy };
    case 'guide':
      return shape.orientation === 'v'
        ? { position: shape.position + dx }
        : { position: shape.position + dy };
    default:
      return {};
  }
}

/** How far a circle/arc's cardinal point sits from its center along one axis, in units of `r`.
 * `center` (and the two cardinal points perpendicular to `axis`) sit on the center itself, so they
 * contribute no offset. */
function circularPointOffset(key: TShapePointKey, axis: 'horizontal' | 'vertical'): number {
  if (axis === 'horizontal') {
    if (key === 'right') {
      return 1;
    }
    if (key === 'left') {
      return -1;
    }
    return 0;
  }
  if (key === 'bottom') {
    return 1;
  }
  if (key === 'top') {
    return -1;
  }
  return 0;
}

/**
 * Patch that grows a shape by `delta` along one axis, used when a bound dimension's value is
 * edited directly. For a `rect`/`line`, the shape always grows outward in the positive direction
 * (right for horizontal, down for vertical) and keeps its other extent fixed: for a `rect` that's
 * simply its `x`/`y` origin; for a `line` it's whichever endpoint has the smaller coordinate on
 * that axis. A `circle`/`arc` instead grows symmetrically about its own center — `delta` is the
 * change in distance between `dimension`'s two bound points, which is either the radius (one
 * endpoint at `center`) or the diameter (both endpoints on opposite cardinal points), so `r` grows
 * by `delta` or `delta / 2` accordingly.
 */
function resizeShapeAlongAxis(
  shape: Extract<TShape, { type: 'rect' | 'line' | 'circle' | 'arc' }>,
  dimension: Extract<TShape, { type: 'dimension' }>,
  delta: number,
): TShapePatch {
  const { axis } = dimension;

  if (shape.type === 'rect') {
    return axis === 'horizontal' ? { w: shape.w + delta } : { h: shape.h + delta };
  }
  if (shape.type === 'line') {
    if (axis === 'horizontal') {
      return shape.x1 >= shape.x2 ? { x1: shape.x1 + delta } : { x2: shape.x2 + delta };
    }
    return shape.y1 >= shape.y2 ? { y1: shape.y1 + delta } : { y2: shape.y2 + delta };
  }

  const span = Math.abs(
    circularPointOffset(dimension.bindingA!.point, axis) -
      circularPointOffset(dimension.bindingB!.point, axis),
  );
  return { r: shape.r + delta / span };
}

/** Patch that mirrors a shape about its own center, in place. */
function flipShape(shape: TShape, axis: 'horizontal' | 'vertical'): TShapePatch {
  switch (shape.type) {
    case 'line':
      // A segment's midpoint is the mirror axis, so reflecting it is just swapping the endpoints'
      // coordinate on that axis.
      return axis === 'horizontal'
        ? { x1: shape.x2, x2: shape.x1 }
        : { y1: shape.y2, y2: shape.y1 };
    case 'arc': {
      // Mirroring reverses the sweep direction; swapping start/end while reflecting each angle
      // keeps the same visual sweep (see transformShape for the identity applied through a parent).
      const reflect = (angle: number) => (axis === 'horizontal' ? 180 - angle : -angle);
      return { startAngle: reflect(shape.endAngle), endAngle: reflect(shape.startAngle) };
    }
    case 'component-instance':
      return axis === 'horizontal' ? { flipX: !shape.flipX } : { flipY: !shape.flipY };
    default:
      return {};
  }
}

/**
 * Maps a component-local point through an instance's scale → rotate → translate transform.
 * `scaleX`/`scaleY` may be negative to represent a flipped axis.
 */
function transformPoint(
  point: TPoint,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  rotationDeg: number,
): TPoint {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const sx = point.x * scaleX;
  const sy = point.y * scaleY;
  return { x: x + sx * cos - sy * sin, y: y + sx * sin + sy * cos };
}

/**
 * Re-expresses a component-local shape in world coordinates, as if it had been drawn directly at
 * the given instance transform instead of rendered through a scaled/rotated Group. Used to "bake"
 * a component instance's contents into independent shapes (e.g. when its definition is deleted).
 */
function transformShape(
  shape: TShape,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  rotation: number,
): TShape {
  // Net axis flips: an odd number of flipped axes mirrors (reverses chirality); an even number
  // (including zero) is chirality-preserving and, for rotation-bearing shapes, equivalent to a
  // plain extra 180° rotation.
  const isFlippedX = scaleX < 0;
  const isFlippedY = scaleY < 0;
  const isMirrored = isFlippedX !== isFlippedY;
  const uniformRotationAdjust = !isMirrored && isFlippedX ? 180 : 0;
  const magnitude = Math.abs(scaleX);

  switch (shape.type) {
    case 'line': {
      const p1 = transformPoint({ x: shape.x1, y: shape.y1 }, x, y, scaleX, scaleY, rotation);
      const p2 = transformPoint({ x: shape.x2, y: shape.y2 }, x, y, scaleX, scaleY, rotation);
      return { ...shape, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    }
    case 'rect': {
      // Exact for the non-mirrored case (uniform scale, possibly +180°). Under a single-axis flip
      // combined with the child's own rotation, a plain {x,y,w,h,rotation} can't represent true
      // mirroring exactly, so this is a best-effort placement — same tradeoff as 'dimension' below.
      const p = transformPoint({ x: shape.x, y: shape.y }, x, y, scaleX, scaleY, rotation);
      return {
        ...shape,
        x: p.x,
        y: p.y,
        w: shape.w * magnitude,
        h: shape.h * magnitude,
        rotation: shape.rotation + rotation + uniformRotationAdjust,
      };
    }
    case 'circle': {
      const p = transformPoint({ x: shape.cx, y: shape.cy }, x, y, scaleX, scaleY, rotation);
      return { ...shape, cx: p.x, cy: p.y, r: shape.r * magnitude };
    }
    case 'arc': {
      const p = transformPoint({ x: shape.cx, y: shape.cy }, x, y, scaleX, scaleY, rotation);
      if (isMirrored) {
        // Mirroring reverses the sweep direction; swapping start/end while reflecting each angle
        // keeps the same visual sweep (see flipShape for the same identity applied directly).
        const reflect = (angle: number) => (isFlippedX ? 180 - angle : -angle) + rotation;
        return {
          ...shape,
          cx: p.x,
          cy: p.y,
          r: shape.r * magnitude,
          startAngle: reflect(shape.endAngle),
          endAngle: reflect(shape.startAngle),
        };
      }
      return {
        ...shape,
        cx: p.x,
        cy: p.y,
        r: shape.r * magnitude,
        startAngle: shape.startAngle + rotation + uniformRotationAdjust,
        endAngle: shape.endAngle + rotation + uniformRotationAdjust,
      };
    }
    case 'text': {
      const p = transformPoint({ x: shape.x, y: shape.y }, x, y, scaleX, scaleY, rotation);
      return { ...shape, x: p.x, y: p.y, fontSize: shape.fontSize * magnitude };
    }
    case 'dimension': {
      // Axis-aligned by construction; a rotated instance can't be represented exactly, so this is
      // a best-effort placement (points transform correctly, axis/offset assume no rotation).
      const p1 = transformPoint({ x: shape.x1, y: shape.y1 }, x, y, scaleX, scaleY, rotation);
      const p2 = transformPoint({ x: shape.x2, y: shape.y2 }, x, y, scaleX, scaleY, rotation);
      // Bindings reference shape ids that are regenerated on flatten, so they'd otherwise dangle.
      return {
        ...shape,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        offset: shape.offset * magnitude,
        bindingA: null,
        bindingB: null,
      };
    }
    case 'guide': {
      if (shape.orientation === 'v') {
        const p = transformPoint({ x: shape.position, y: 0 }, x, y, scaleX, scaleY, rotation);
        return { ...shape, position: p.x };
      }
      const p = transformPoint({ x: 0, y: shape.position }, x, y, scaleX, scaleY, rotation);
      return { ...shape, position: p.y };
    }
    case 'component-instance': {
      // Best-effort under a single-axis flip combined with the child instance's own rotation, for
      // the same reason as 'rect' above.
      const p = transformPoint({ x: shape.x, y: shape.y }, x, y, scaleX, scaleY, rotation);
      return {
        ...shape,
        x: p.x,
        y: p.y,
        scale: shape.scale * magnitude,
        rotation: shape.rotation + rotation + uniformRotationAdjust,
        flipX: shape.flipX !== isFlippedX,
        flipY: shape.flipY !== isFlippedY,
      };
    }
    default:
      return shape;
  }
}

/**
 * Bakes a component instance's contents into independent, freestanding shapes in world space —
 * used when a component definition is deleted so its existing instances survive as plain shapes
 * instead of vanishing along with it.
 */
function flattenComponentInstance(
  instance: Extract<TShape, { type: 'component-instance' }>,
  componentDef: TComponentDef,
): TShape[] {
  const scaleX = instance.flipX ? -instance.scale : instance.scale;
  const scaleY = instance.flipY ? -instance.scale : instance.scale;
  return componentDef.shapes.map(shape => ({
    ...transformShape(shape, instance.x, instance.y, scaleX, scaleY, instance.rotation),
    id: crypto.randomUUID(),
  }));
}

export {
  getShapeAnchor,
  translateShape,
  resizeShapeAlongAxis,
  flattenComponentInstance,
  flipShape,
};
