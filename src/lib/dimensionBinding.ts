import type {
  TDimensionBinding,
  TShape,
  TShapeId,
  TShapePatch,
  TShapePointKey,
} from '~/types/document';

import { BINDING_EPSILON } from '~/constants/dimension';

import { listBindablePoints } from '~/lib/bounds';
import { convertLengthToInternal } from '~/lib/dimension';
import { resizeShapeAlongAxis } from '~/lib/shapeTransform';

type TPoint = { x: number; y: number };

function getBoundPoint(shape: TShape, key: TShapePointKey): TPoint | null {
  const found = listBindablePoints(shape).find(candidate => candidate.key === key);
  return found ? found.point : null;
}

/**
 * Resolves the shape a dimension's length actually measures, so editing the dimension's value
 * can resize it in turn. Only defined when both endpoints are bound to the same shape and that
 * shape exposes at least two distinct bindable points (`rect`, `line`, `circle`, `arc`) — `text`
 * and `component-instance` expose only a single `origin` point, so a dimension spanning one of
 * those can't represent its own size.
 */
function findDimensionResizeTarget(
  dimension: Extract<TShape, { type: 'dimension' }>,
  shapes: TShape[],
): Extract<TShape, { type: 'rect' | 'line' | 'circle' | 'arc' }> | null {
  if (!dimension.bindingA || !dimension.bindingB) {
    return null;
  }
  if (dimension.bindingA.shapeId !== dimension.bindingB.shapeId) {
    return null;
  }
  const target = shapes.find(shape => shape.id === dimension.bindingA!.shapeId);
  if (
    !target ||
    (target.type !== 'rect' &&
      target.type !== 'line' &&
      target.type !== 'circle' &&
      target.type !== 'arc')
  ) {
    return null;
  }
  return target;
}

/**
 * Applies a user-typed length to a bound dimension: resolves the shape it measures and returns the
 * patch that resizes it by the difference between the typed length and the dimension's current one.
 * Returns null when the dimension isn't resolvable, the value isn't a valid positive number, or the
 * value doesn't actually change the length.
 */
function computeDimensionResizePatch(
  dimension: Extract<TShape, { type: 'dimension' }>,
  shapes: TShape[],
  documentScale: number,
  documentUnits: 'mm' | 'cm' | 'm',
  rawValue: string,
): { targetId: TShapeId; patch: TShapePatch } | null {
  const target = findDimensionResizeTarget(dimension, shapes);
  if (!target) {
    return null;
  }
  const enteredLength = Number(rawValue.replace(',', '.'));
  if (!Number.isFinite(enteredLength) || enteredLength <= 0) {
    return null;
  }
  const currentInternal =
    dimension.axis === 'vertical'
      ? Math.abs(dimension.y2 - dimension.y1)
      : Math.abs(dimension.x2 - dimension.x1);
  const newInternal = convertLengthToInternal(
    enteredLength,
    documentScale,
    documentUnits,
    dimension.unit,
  );
  const delta = newInternal - currentInternal;
  if (delta === 0) {
    return null;
  }
  return { targetId: target.id, patch: resizeShapeAlongAxis(target, dimension, delta) };
}

/** Finds the shape+point that exactly matches `point` (already snapped by the caller), if any. */
function findBindingForPoint(shapes: TShape[], point: TPoint): TDimensionBinding | null {
  for (const shape of shapes) {
    for (const candidate of listBindablePoints(shape)) {
      if (
        Math.abs(candidate.point.x - point.x) <= BINDING_EPSILON &&
        Math.abs(candidate.point.y - point.y) <= BINDING_EPSILON
      ) {
        return { shapeId: shape.id, point: candidate.key };
      }
    }
  }
  return null;
}

/**
 * Re-derives every dimension's bound endpoints from its target shapes' current state. Called after
 * any shape mutation so a dimension whose extension lines are bound to a point follows that point
 * (and keeps its length up to date) whenever the owning shape moves, resizes, or rotates.
 */
function resyncDimensionBindings(shapes: TShape[]): TShape[] {
  let changed = false;

  const next = shapes.map(shape => {
    if (shape.type !== 'dimension') {
      return shape;
    }
    if (!shape.bindingA && !shape.bindingB) {
      return shape;
    }

    let patch: Partial<Extract<TShape, { type: 'dimension' }>> = {};

    if (shape.bindingA) {
      const target = shapes.find(candidate => candidate.id === shape.bindingA!.shapeId);
      const point = target ? getBoundPoint(target, shape.bindingA.point) : null;
      if (point && (point.x !== shape.x1 || point.y !== shape.y1)) {
        patch = { ...patch, x1: point.x, y1: point.y };
      }
    }

    if (shape.bindingB) {
      const target = shapes.find(candidate => candidate.id === shape.bindingB!.shapeId);
      const point = target ? getBoundPoint(target, shape.bindingB.point) : null;
      if (point && (point.x !== shape.x2 || point.y !== shape.y2)) {
        patch = { ...patch, x2: point.x, y2: point.y };
      }
    }

    if (Object.keys(patch).length === 0) {
      return shape;
    }
    changed = true;
    return { ...shape, ...patch };
  });

  return changed ? next : shapes;
}

export {
  findBindingForPoint,
  resyncDimensionBindings,
  findDimensionResizeTarget,
  computeDimensionResizePatch,
};
