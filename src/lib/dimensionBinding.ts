import { rotatePoint } from '~/lib/bounds'
import type { DimensionBinding, Shape, ShapePointKey } from '~/types/document'

type Point = { x: number; y: number }

/** Coordinates match within this tolerance are treated as "the same point" (they come from
 * snapCursor, which already snaps onto candidate coordinates exactly). */
const BINDING_EPSILON = 1e-6

/** Points on a shape that a dimension's endpoint can bind to. Mirrors the point set offered by
 * collectSnapTargets, but keyed per-shape (and rotation-aware for rects) so a binding can be
 * resolved back to a live coordinate later. Guides and dimensions have no bindable points. */
export function listBindablePoints(shape: Shape): { key: ShapePointKey; point: Point }[] {
  switch (shape.type) {
    case 'line':
      return [
        { key: 'p1', point: { x: shape.x1, y: shape.y1 } },
        { key: 'p2', point: { x: shape.x2, y: shape.y2 } },
      ]
    case 'rect': {
      const origin = { x: shape.x, y: shape.y }
      const corners: { key: ShapePointKey; local: Point }[] = [
        { key: 'tl', local: { x: 0, y: 0 } },
        { key: 'tr', local: { x: shape.w, y: 0 } },
        { key: 'br', local: { x: shape.w, y: shape.h } },
        { key: 'bl', local: { x: 0, y: shape.h } },
      ]
      return corners.map(({ key, local }) => ({
        key,
        point: rotatePoint({ x: shape.x + local.x, y: shape.y + local.y }, origin, shape.rotation),
      }))
    }
    case 'circle':
    case 'arc':
      return [{ key: 'center', point: { x: shape.cx, y: shape.cy } }]
    case 'text':
    case 'component-instance':
      return [{ key: 'origin', point: { x: shape.x, y: shape.y } }]
    default:
      return []
  }
}

/** Resolves a binding's point key back to a live coordinate on its current shape state. */
export function getBoundPoint(shape: Shape, key: ShapePointKey): Point | null {
  const found = listBindablePoints(shape).find((candidate) => candidate.key === key)
  return found ? found.point : null
}

/** Finds the shape+point that exactly matches `point` (already snapped by the caller), if any. */
export function findBindingForPoint(shapes: Shape[], point: Point): DimensionBinding | null {
  for (const shape of shapes) {
    for (const candidate of listBindablePoints(shape)) {
      if (
        Math.abs(candidate.point.x - point.x) <= BINDING_EPSILON &&
        Math.abs(candidate.point.y - point.y) <= BINDING_EPSILON
      ) {
        return { shapeId: shape.id, point: candidate.key }
      }
    }
  }
  return null
}

/**
 * Re-derives every dimension's bound endpoints from its target shapes' current state. Called after
 * any shape mutation so a dimension whose extension lines are bound to a point follows that point
 * (and keeps its length up to date) whenever the owning shape moves, resizes, or rotates.
 */
export function resyncDimensionBindings(shapes: Shape[]): Shape[] {
  let changed = false

  const next = shapes.map((shape) => {
    if (shape.type !== 'dimension') return shape
    if (!shape.bindingA && !shape.bindingB) return shape

    let patch: Partial<Extract<Shape, { type: 'dimension' }>> = {}

    if (shape.bindingA) {
      const target = shapes.find((candidate) => candidate.id === shape.bindingA!.shapeId)
      const point = target ? getBoundPoint(target, shape.bindingA.point) : null
      if (point && (point.x !== shape.x1 || point.y !== shape.y1)) {
        patch = { ...patch, x1: point.x, y1: point.y }
      }
    }

    if (shape.bindingB) {
      const target = shapes.find((candidate) => candidate.id === shape.bindingB!.shapeId)
      const point = target ? getBoundPoint(target, shape.bindingB.point) : null
      if (point && (point.x !== shape.x2 || point.y !== shape.y2)) {
        patch = { ...patch, x2: point.x, y2: point.y }
      }
    }

    if (Object.keys(patch).length === 0) return shape
    changed = true
    return { ...shape, ...patch }
  })

  return changed ? next : shapes
}
