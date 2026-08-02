import { useCallback, useEffect, useState } from 'react';

import type { TShape, TShapeId } from '~/types/document';

import { MOVE_DRAG_THRESHOLD_PX } from '~/constants/canvas';
import { MOVE_PREVIEW_COLOR } from '~/constants/shapes';

import { listBindablePoints } from '~/lib/bounds';
import { collectSnapTargets, snapPoint } from '~/lib/snap';
import { translateShape } from '~/lib/shapeTransform';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';
import { selectionStore, selectionSelectors, selectionActions } from '~/stores/selectionStore';
import { toolStore, toolSelectors, toolActions } from '~/stores/toolStore';
import { uiStore, uiSelectors } from '~/stores/uiStore';
import { viewStore, viewSelectors } from '~/stores/viewStore';

import type { TMoveOrigin, TPoint, TSnapIndicator, TUseMoveToolReturn } from './types';
import type Konva from 'konva';

const NO_SNAP: TSnapIndicator = { x: null, y: null };

function getPointerPosition(stage: Konva.Stage): TPoint {
  return stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!el?.isContentEditable;
}

/** Recolors a shape pale red for the Move tool's ghost preview. Guide/dimension render from fixed
 * constants rather than a per-shape style, and a component-instance's appearance comes from its
 * (possibly deeply nested) definition — none of these have a single color to override, so the
 * preview keeps its normal look for those. */
function withMovePreviewStyle(shape: TShape): TShape {
  switch (shape.type) {
    case 'line':
    case 'rect':
    case 'circle':
    case 'arc':
      return {
        ...shape,
        style: {
          ...shape.style,
          stroke: MOVE_PREVIEW_COLOR,
          fill: shape.style.fill !== undefined ? MOVE_PREVIEW_COLOR : undefined,
        },
      };
    case 'text':
      return { ...shape, fill: MOVE_PREVIEW_COLOR };
    default:
      return shape;
  }
}

function useMoveTool(): TUseMoveToolReturn {
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const shapes = documentStore(documentSelectors.getShapes);
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);
  const areGuidesVisible = uiStore(uiSelectors.getAreGuidesVisible);
  const snapTolerance = uiStore(uiSelectors.getSnapTolerance);
  const viewScale = viewStore(viewSelectors.getScale);

  const [origin, setOrigin] = useState<TMoveOrigin | null>(null);
  const [previewShape, setPreviewShape] = useState<TShape | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<TSnapIndicator>(NO_SNAP);

  useEffect(() => {
    setOrigin(null);
    setPreviewShape(null);
    setSnapIndicator(NO_SNAP);
  }, [activeTool]);

  /** Snap targets for the moved shape's anchor: every other shape's bindable points plus guides,
   * mirroring what the Select tool's drag snaps against. */
  const snapTargets = useCallback(
    (excludeId: TShapeId) => {
      const visibleShapes = areGuidesVisible
        ? shapes
        : shapes.filter(shape => shape.type !== 'guide');
      return collectSnapTargets(visibleShapes, { excludeIds: [excludeId] });
    },
    [shapes, areGuidesVisible],
  );

  const selectedShape =
    selectedIds.length === 1 ? (shapes.find(shape => shape.id === selectedIds[0]) ?? null) : null;

  const anchors =
    activeTool === 'move' && !origin && selectedShape ? listBindablePoints(selectedShape) : null;

  const onPickAnchor = useCallback(
    (point: TPoint, e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!selectedShape) {
        return;
      }
      const stage = e.target.getStage();
      const pickPointer = stage ? getPointerPosition(stage) : point;
      setOrigin({ shape: selectedShape, anchor: point, pickPointer });
      setPreviewShape(withMovePreviewStyle(selectedShape));
    },
    [selectedShape],
  );

  const onMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'move' || !origin) {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const rawPoint = getPointerPosition(stage);
      const snapped = snapPoint(rawPoint, snapTargets(origin.shape.id), snapTolerance / viewScale);
      setSnapIndicator({
        x: snapped.snappedX ? snapped.x : null,
        y: snapped.snappedY ? snapped.y : null,
      });
      const dx = snapped.x - origin.anchor.x;
      const dy = snapped.y - origin.anchor.y;
      const moved = { ...origin.shape, ...translateShape(origin.shape, dx, dy) } as TShape;
      setPreviewShape(withMovePreviewStyle(moved));
    },
    [activeTool, origin, snapTargets, snapTolerance, viewScale],
  );

  const commitMove = useCallback(
    (moveOrigin: TMoveOrigin, rawPoint: TPoint) => {
      const snapped = snapPoint(
        rawPoint,
        snapTargets(moveOrigin.shape.id),
        snapTolerance / viewScale,
      );
      const dx = snapped.x - moveOrigin.anchor.x;
      const dy = snapped.y - moveOrigin.anchor.y;
      documentActions.updateShape(moveOrigin.shape.id, translateShape(moveOrigin.shape, dx, dy));
      setOrigin(null);
      setPreviewShape(null);
      setSnapIndicator(NO_SNAP);
      selectionActions.select([moveOrigin.shape.id]);
      toolActions.setTool('select');
    },
    [snapTargets, snapTolerance, viewScale],
  );

  const onMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'move' || !origin) {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      commitMove(origin, getPointerPosition(stage));
    },
    [activeTool, origin, commitMove],
  );

  // Distinguishes a plain click on an anchor (pick, then wait for a second click to place) from a
  // press-drag-release gesture: only the latter should commit right here, at the point the button
  // was actually released — otherwise the tool stays armed for the click-to-place flow above.
  const onMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'move' || !origin) {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = getPointerPosition(stage);
      const dragDistance = Math.hypot(
        point.x - origin.pickPointer.x,
        point.y - origin.pickPointer.y,
      );
      if (dragDistance < MOVE_DRAG_THRESHOLD_PX / viewScale) {
        return;
      }
      commitMove(origin, point);
    },
    [activeTool, origin, viewScale, commitMove],
  );

  useEffect(() => {
    if (activeTool !== 'move' || !origin) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape' || isTypingTarget(e.target)) {
        return;
      }
      e.preventDefault();
      setOrigin(null);
      setPreviewShape(null);
      setSnapIndicator(NO_SNAP);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, origin]);

  return {
    anchors,
    previewShape,
    snapIndicator,
    onPickAnchor,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}

export { useMoveTool };
