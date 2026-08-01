import type { TShape, TShapePointKey } from '~/types/document';

import type Konva from 'konva';

type TPoint = { x: number; y: number };

type TMoveAnchor = { key: TShapePointKey; point: TPoint };

/** Snapshot of the shape and the point on it picked as the anchor, taken once when the anchor is
 * picked so the move delta stays stable even though the document's own copy of the shape never
 * changes until the move commits. */
type TMoveOrigin = { shape: TShape; anchor: TPoint };

type TUseMoveToolReturn = {
  /** Pickable anchor points on the selected shape, shown while waiting for the user to grab one.
   * Null whenever there's nothing to show: tool inactive, no single shape selected, or an anchor
   * has already been picked. */
  anchors: TMoveAnchor[] | null;
  /** Pale-red copy of the selected shape, translated so the picked anchor tracks the pointer. Null
   * until an anchor has been picked. */
  previewShape: TShape | null;
  onPickAnchor: (point: TPoint) => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export type { TPoint, TMoveAnchor, TMoveOrigin, TUseMoveToolReturn };
