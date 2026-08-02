import type { TShape, TShapePointKey } from '~/types/document';

import type Konva from 'konva';

type TPoint = { x: number; y: number };

type TSnapIndicator = { x: number | null; y: number | null };

type TMoveAnchor = { key: TShapePointKey; point: TPoint };

/** Snapshot of the shape and the point on it picked as the anchor, taken once when the anchor is
 * picked so the move delta stays stable even though the document's own copy of the shape never
 * changes until the move commits. `pickPointer` is the raw pointer position at pick time, kept
 * only to tell a plain click apart from a drag-to-place gesture on mouse up. */
type TMoveOrigin = { shape: TShape; anchor: TPoint; pickPointer: TPoint };

type TUseMoveToolReturn = {
  /** Pickable anchor points on the selected shape, shown while waiting for the user to grab one.
   * Null whenever there's nothing to show: tool inactive, no single shape selected, or an anchor
   * has already been picked. */
  anchors: TMoveAnchor[] | null;
  /** Pale-red copy of the selected shape, translated so the picked anchor tracks the pointer,
   * snapped to nearby bindable points/guides. Null until an anchor has been picked. */
  previewShape: TShape | null;
  /** Alignment guide lines to draw, mirroring the picked anchor's snapped axes. Null on an axis
   * where the anchor isn't currently snapped to anything. */
  snapIndicator: TSnapIndicator;
  onPickAnchor: (point: TPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void;
};

export type { TPoint, TSnapIndicator, TMoveAnchor, TMoveOrigin, TUseMoveToolReturn };
