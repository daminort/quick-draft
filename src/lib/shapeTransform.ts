import type { ComponentDef, Shape, ShapePatch } from '~/types/document'

type Point = { x: number; y: number }

/** A representative anchor coordinate per shape type, used to measure how far a shape moved. */
export function getShapeAnchor(shape: Shape): Point {
  switch (shape.type) {
    case 'rect':
    case 'text':
    case 'component-instance':
      return { x: shape.x, y: shape.y }
    case 'circle':
    case 'arc':
      return { x: shape.cx, y: shape.cy }
    case 'line':
    case 'dimension':
      return { x: shape.x1, y: shape.y1 }
    case 'guide':
      return shape.orientation === 'v' ? { x: shape.position, y: 0 } : { x: 0, y: shape.position }
    default:
      return { x: 0, y: 0 }
  }
}

/** Patch that rigidly translates a shape by (dx, dy), independent of any snapping. */
export function translateShape(shape: Shape, dx: number, dy: number): ShapePatch {
  switch (shape.type) {
    case 'line':
      return { x1: shape.x1 + dx, y1: shape.y1 + dy, x2: shape.x2 + dx, y2: shape.y2 + dy }
    case 'rect':
    case 'text':
    case 'component-instance':
      return { x: shape.x + dx, y: shape.y + dy }
    case 'circle':
      return { cx: shape.cx + dx, cy: shape.cy + dy }
    case 'arc':
      return { cx: shape.cx + dx, cy: shape.cy + dy }
    case 'dimension':
      return { x1: shape.x1 + dx, y1: shape.y1 + dy, x2: shape.x2 + dx, y2: shape.y2 + dy }
    case 'guide':
      return shape.orientation === 'v'
        ? { position: shape.position + dx }
        : { position: shape.position + dy }
    default:
      return {}
  }
}

/** Maps a component-local point through an instance's scale → rotate → translate transform. */
function transformPoint(
  point: Point,
  x: number,
  y: number,
  scale: number,
  rotationDeg: number,
): Point {
  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const sx = point.x * scale
  const sy = point.y * scale
  return { x: x + sx * cos - sy * sin, y: y + sx * sin + sy * cos }
}

/**
 * Re-expresses a component-local shape in world coordinates, as if it had been drawn directly at
 * the given instance transform instead of rendered through a scaled/rotated Group. Used to "bake"
 * a component instance's contents into independent shapes (e.g. when its definition is deleted).
 */
function transformShape(
  shape: Shape,
  x: number,
  y: number,
  scale: number,
  rotation: number,
): Shape {
  switch (shape.type) {
    case 'line': {
      const p1 = transformPoint({ x: shape.x1, y: shape.y1 }, x, y, scale, rotation)
      const p2 = transformPoint({ x: shape.x2, y: shape.y2 }, x, y, scale, rotation)
      return { ...shape, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
    }
    case 'rect': {
      const p = transformPoint({ x: shape.x, y: shape.y }, x, y, scale, rotation)
      return {
        ...shape,
        x: p.x,
        y: p.y,
        w: shape.w * scale,
        h: shape.h * scale,
        rotation: shape.rotation + rotation,
      }
    }
    case 'circle': {
      const p = transformPoint({ x: shape.cx, y: shape.cy }, x, y, scale, rotation)
      return { ...shape, cx: p.x, cy: p.y, r: shape.r * scale }
    }
    case 'arc': {
      const p = transformPoint({ x: shape.cx, y: shape.cy }, x, y, scale, rotation)
      return {
        ...shape,
        cx: p.x,
        cy: p.y,
        r: shape.r * scale,
        startAngle: shape.startAngle + rotation,
        endAngle: shape.endAngle + rotation,
      }
    }
    case 'text': {
      const p = transformPoint({ x: shape.x, y: shape.y }, x, y, scale, rotation)
      return { ...shape, x: p.x, y: p.y, fontSize: shape.fontSize * scale }
    }
    case 'dimension': {
      // Axis-aligned by construction; a rotated instance can't be represented exactly, so this is
      // a best-effort placement (points transform correctly, axis/offset assume no rotation).
      const p1 = transformPoint({ x: shape.x1, y: shape.y1 }, x, y, scale, rotation)
      const p2 = transformPoint({ x: shape.x2, y: shape.y2 }, x, y, scale, rotation)
      return { ...shape, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, offset: shape.offset * scale }
    }
    case 'guide': {
      if (shape.orientation === 'v') {
        const p = transformPoint({ x: shape.position, y: 0 }, x, y, scale, rotation)
        return { ...shape, position: p.x }
      }
      const p = transformPoint({ x: 0, y: shape.position }, x, y, scale, rotation)
      return { ...shape, position: p.y }
    }
    case 'component-instance': {
      const p = transformPoint({ x: shape.x, y: shape.y }, x, y, scale, rotation)
      return {
        ...shape,
        x: p.x,
        y: p.y,
        scale: shape.scale * scale,
        rotation: shape.rotation + rotation,
      }
    }
    default:
      return shape
  }
}

/**
 * Bakes a component instance's contents into independent, freestanding shapes in world space —
 * used when a component definition is deleted so its existing instances survive as plain shapes
 * instead of vanishing along with it.
 */
export function flattenComponentInstance(
  instance: Extract<Shape, { type: 'component-instance' }>,
  componentDef: ComponentDef,
): Shape[] {
  return componentDef.shapes.map((shape) => ({
    ...transformShape(shape, instance.x, instance.y, instance.scale, instance.rotation),
    id: crypto.randomUUID(),
  }))
}
