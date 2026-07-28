import type { Shape, ShapePatch } from '~/types/document'

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
