import type { Shape, ShapeId } from '~/types/document'
import { SNAP_TOLERANCE_PX } from '~/constants/canvas'

export interface SnapTargets {
  xs: number[]
  ys: number[]
}

export interface SnapResult {
  x: number
  y: number
  snappedX: boolean
  snappedY: boolean
}

export function collectSnapTargets(
  shapes: Shape[],
  options: { excludeIds?: ShapeId[] } = {},
): SnapTargets {
  const xs: number[] = []
  const ys: number[] = []
  const addPoint = (x: number, y: number) => {
    xs.push(x)
    ys.push(y)
  }

  for (const shape of shapes) {
    if (options.excludeIds?.includes(shape.id)) continue

    switch (shape.type) {
      case 'guide':
        if (shape.orientation === 'v') xs.push(shape.position)
        else if (shape.orientation === 'h') ys.push(shape.position)
        break
      case 'line':
        addPoint(shape.x1, shape.y1)
        addPoint(shape.x2, shape.y2)
        break
      case 'rect':
        addPoint(shape.x, shape.y)
        addPoint(shape.x + shape.w, shape.y)
        addPoint(shape.x, shape.y + shape.h)
        addPoint(shape.x + shape.w, shape.y + shape.h)
        break
      case 'circle':
        addPoint(shape.cx, shape.cy)
        break
      case 'arc':
        addPoint(shape.cx, shape.cy)
        break
      case 'text':
        addPoint(shape.x, shape.y)
        break
      case 'component-instance':
        addPoint(shape.x, shape.y)
        break
      default:
        break
    }
  }

  return { xs, ys }
}

function closest(value: number, candidates: number[], tolerance: number): number | null {
  let best: number | null = null
  let bestDistance = tolerance

  for (const candidate of candidates) {
    const distance = Math.abs(candidate - value)
    if (distance <= bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }

  return best
}

export function snapPoint(
  point: { x: number; y: number },
  targets: SnapTargets,
  tolerancePx: number = SNAP_TOLERANCE_PX,
): SnapResult {
  const snappedX = closest(point.x, targets.xs, tolerancePx)
  const snappedY = closest(point.y, targets.ys, tolerancePx)

  return {
    x: snappedX ?? point.x,
    y: snappedY ?? point.y,
    snappedX: snappedX !== null,
    snappedY: snappedY !== null,
  }
}
