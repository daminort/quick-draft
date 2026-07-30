type TPoint = { x: number; y: number };

/**
 * Unit vector from `start` toward `point`. When `isShiftLocked`, the vector is snapped to the
 * dominant axis (horizontal or vertical) — same convention as the `line` tool's Shift handling
 * in useDrawingTool.ts. Falls back to pointing right/down when start and point coincide, so
 * callers always get a usable direction to multiply a typed length by.
 */
function rulerDirection(start: TPoint, point: TPoint, isShiftLocked: boolean): TPoint {
  const dx = point.x - start.x;
  const dy = point.y - start.y;

  if (isShiftLocked) {
    return Math.abs(dx) > Math.abs(dy)
      ? { x: Math.sign(dx) || 1, y: 0 }
      : { x: 0, y: Math.sign(dy) || 1 };
  }

  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return { x: 1, y: 0 };
  }
  return { x: dx / distance, y: dy / distance };
}

function rulerEndpoint(start: TPoint, direction: TPoint, internalLength: number): TPoint {
  return { x: start.x + direction.x * internalLength, y: start.y + direction.y * internalLength };
}

/**
 * Real-world length (in `documentUnits`) for an internal canvas distance. Mirrors the
 * `internalDistance * documentScale` step in lib/dimension.ts's convertLength for the
 * same-unit case (the ruler always displays/accepts lengths in the document's own units).
 */
function internalToRealLength(internalLength: number, documentScale: number): number {
  return internalLength * documentScale;
}

function realToInternalLength(realLength: number, documentScale: number): number {
  return realLength / documentScale;
}

export { rulerDirection, rulerEndpoint, internalToRealLength, realToInternalLength };
