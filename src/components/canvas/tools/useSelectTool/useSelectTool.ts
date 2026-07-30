import { useCallback, useEffect, useRef, useState } from 'react';

import type { TShape, TShapeId, TShapePatch } from '~/types/document';

import { MARQUEE_CLICK_THRESHOLD_PX } from '~/constants/canvas';

import { collectSnapTargets, snapPoint, type TSnapTargets } from '~/lib/snap';
import { getShapeBounds, areBoundsIntersecting } from '~/lib/bounds';
import { getShapeAnchor, translateShape } from '~/lib/shapeTransform';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { selectionStore, selectionSelectors, selectionActions } from '~/stores/selectionStore';
import { toolStore, toolSelectors } from '~/stores/toolStore';
import { useUIStore } from '~/stores/useUIStore';
import { useViewStore } from '~/stores/useViewStore';

import type {
  TPoint,
  TSnapIndicator,
  TMarqueeRect,
  TManualDrag,
  TMarqueeDrag,
  TUseSelectToolReturn,
} from './types';
import type Konva from 'konva';

const NO_SNAP: TSnapIndicator = { x: null, y: null };

function computeDragResult(
  shape: TShape,
  node: Konva.Node,
  targets: TSnapTargets,
  tolerance: number,
): { patch: TShapePatch; indicator: TSnapIndicator } {
  switch (shape.type) {
    case 'rect':
    case 'text':
    case 'component-instance': {
      const snapped = snapPoint({ x: node.x(), y: node.y() }, targets, tolerance);
      return {
        patch: { x: snapped.x, y: snapped.y },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      };
    }
    case 'circle': {
      const snapped = snapPoint({ x: node.x(), y: node.y() }, targets, tolerance);
      return {
        patch: { cx: snapped.x, cy: snapped.y },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      };
    }
    case 'line': {
      const snapped = snapPoint({ x: node.x(), y: node.y() }, targets, tolerance);
      const dx = snapped.x - shape.x1;
      const dy = snapped.y - shape.y1;
      return {
        patch: { x1: snapped.x, y1: snapped.y, x2: shape.x2 + dx, y2: shape.y2 + dy },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      };
    }
    case 'guide': {
      if (shape.orientation === 'v') {
        const snapped = snapPoint({ x: node.x(), y: 0 }, targets, tolerance);
        return {
          patch: { position: snapped.x },
          indicator: { x: snapped.snappedX ? snapped.x : null, y: null },
        };
      }
      const snapped = snapPoint({ x: 0, y: node.y() }, targets, tolerance);
      return {
        patch: { position: snapped.y },
        indicator: { x: null, y: snapped.snappedY ? snapped.y : null },
      };
    }
    default:
      return { patch: {}, indicator: NO_SNAP };
  }
}

/**
 * Arc and dimension render at a fixed (0,0) Konva baseline (their geometry is already absolute),
 * so Konva's own `draggable` — which tracks position via a one-time absolute-position offset
 * captured at drag start — doesn't compose cleanly with resetting that baseline every render.
 * These two are dragged manually instead: track the pointer position (already zoom-compensated,
 * the same primitive the drawing tools use) from mousedown to mouseup ourselves, with no
 * dependency on Konva's internal drag/position bookkeeping at all.
 */
function computeManualDragPatch(
  shape: TShape,
  delta: TPoint,
  targets: TSnapTargets,
  tolerance: number,
): { patch: TShapePatch; indicator: TSnapIndicator } {
  switch (shape.type) {
    case 'arc': {
      const snapped = snapPoint(
        { x: shape.cx + delta.x, y: shape.cy + delta.y },
        targets,
        tolerance,
      );
      return {
        patch: { cx: snapped.x, cy: snapped.y },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      };
    }
    case 'dimension': {
      const projected = shape.axis === 'vertical' ? delta.x : delta.y;
      return { patch: { offset: shape.offset + projected }, indicator: NO_SNAP };
    }
    default:
      return { patch: {}, indicator: NO_SNAP };
  }
}

export function useSelectTool(): TUseSelectToolReturn {
  const updateShape = useDocumentStore(state => state.updateShape);
  const shapes = useDocumentStore(state => state.document.shapes);
  const components = useDocumentStore(state => state.document.components);
  const areGuidesVisible = useUIStore(state => state.areGuidesVisible);
  const snapTolerance = useUIStore(state => state.snapTolerance);
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const viewScale = useViewStore(state => state.scale);
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);
  const nodeRefs = useRef(new Map<TShapeId, Konva.Node>());
  const manualDrag = useRef<TManualDrag | null>(null);
  const marqueeDrag = useRef<TMarqueeDrag | null>(null);
  const groupDragOrigin = useRef<Map<TShapeId, TShape> | null>(null);
  const groupDragAnchorId = useRef<TShapeId | null>(null);
  const manualGroupOrigin = useRef<Map<TShapeId, TShape> | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<TSnapIndicator>(NO_SNAP);
  const [marqueeRect, setMarqueeRect] = useState<TMarqueeRect | null>(null);

  const snapshotSelection = useCallback((): Map<TShapeId, TShape> => {
    const snapshot = new Map<TShapeId, TShape>();
    for (const id of selectedIds) {
      const found = shapes.find(s => s.id === id);
      if (found) {
        snapshot.set(id, found);
      }
    }
    return snapshot;
  }, [selectedIds, shapes]);

  const registerNode = useCallback((id: TShapeId, node: Konva.Node | null) => {
    if (node) {
      nodeRefs.current.set(id, node);
    } else {
      nodeRefs.current.delete(id);
    }
  }, []);

  const getNode = useCallback((id: TShapeId) => nodeRefs.current.get(id) ?? null, []);

  const selectShape = useCallback((id: TShapeId) => selectionActions.select([id]), []);

  const onStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) {
        return;
      }
      if (activeTool !== 'select') {
        selectionActions.clear();
        return;
      }
      const stage = e.target.getStage();
      const pointer = stage?.getRelativePointerPosition();
      if (!stage || !pointer) {
        return;
      }
      marqueeDrag.current = {
        stage,
        startPointer: pointer,
        startClientPointer: { x: e.evt.clientX, y: e.evt.clientY },
      };
      setMarqueeRect({ x: pointer.x, y: pointer.y, width: 0, height: 0 });
    },
    [activeTool],
  );

  const onDragStart = useCallback(
    (shape: TShape) => {
      if (selectedIds.includes(shape.id) && selectedIds.length > 1) {
        groupDragOrigin.current = snapshotSelection();
        groupDragAnchorId.current = shape.id;
      } else {
        selectShape(shape.id);
        groupDragOrigin.current = null;
        groupDragAnchorId.current = null;
      }
      useDocumentStore.temporal.getState().pause();
    },
    [selectShape, selectedIds, snapshotSelection],
  );

  const dragTargets = useCallback(
    (excludeIds: TShapeId[]): TSnapTargets => {
      const visibleShapes = areGuidesVisible
        ? shapes
        : shapes.filter(shape => shape.type !== 'guide');
      return collectSnapTargets(visibleShapes, { excludeIds });
    },
    [shapes, areGuidesVisible],
  );

  /**
   * Applies a drag frame for `shape`. When it's the anchor of an active multi-shape drag, only the
   * anchor snaps (against targets outside the whole selection) and every other selected shape is
   * translated by the same resulting delta, computed from each shape's drag-start snapshot so
   * per-frame patches never compound rounding error.
   */
  const applyDrag = useCallback(
    (shape: TShape, node: Konva.Node): TSnapIndicator => {
      const origin = groupDragOrigin.current;
      if (origin && origin.size > 1 && groupDragAnchorId.current === shape.id) {
        const anchorOrigin = origin.get(shape.id);
        if (!anchorOrigin) {
          return NO_SNAP;
        }
        const { patch, indicator } = computeDragResult(
          anchorOrigin,
          node,
          dragTargets(Array.from(origin.keys())),
          snapTolerance / viewScale,
        );
        const anchorStart = getShapeAnchor(anchorOrigin);
        const anchorNow = getShapeAnchor({ ...anchorOrigin, ...patch } as TShape);
        const dx = anchorNow.x - anchorStart.x;
        const dy = anchorNow.y - anchorStart.y;
        updateShape(shape.id, patch);
        origin.forEach((originShape, id) => {
          if (id === shape.id) {
            return;
          }
          updateShape(id, translateShape(originShape, dx, dy));
        });
        return indicator;
      }

      const { patch, indicator } = computeDragResult(
        shape,
        node,
        dragTargets([shape.id]),
        snapTolerance / viewScale,
      );
      updateShape(shape.id, patch);
      return indicator;
    },
    [updateShape, dragTargets, snapTolerance, viewScale],
  );

  const onDragMove = useCallback(
    (shape: TShape, node: Konva.Node) => {
      setSnapIndicator(applyDrag(shape, node));
    },
    [applyDrag],
  );

  const onDragEnd = useCallback(
    (shape: TShape, node: Konva.Node) => {
      applyDrag(shape, node);
      groupDragOrigin.current = null;
      groupDragAnchorId.current = null;
      useDocumentStore.temporal.getState().resume();
      setSnapIndicator(NO_SNAP);
    },
    [applyDrag],
  );

  const onManualMouseDown = useCallback(
    (shape: TShape, e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pointer = stage?.getRelativePointerPosition();
      if (!stage || !pointer) {
        return;
      }
      manualDrag.current = { origin: shape, startPointer: pointer, stage };
      if (shape.type !== 'dimension' && selectedIds.includes(shape.id) && selectedIds.length > 1) {
        manualGroupOrigin.current = snapshotSelection();
      } else {
        selectShape(shape.id);
        manualGroupOrigin.current = null;
      }
      useDocumentStore.temporal.getState().pause();
    },
    [selectShape, selectedIds, snapshotSelection],
  );

  useEffect(() => {
    function onWindowMouseMove() {
      const drag = manualDrag.current;
      if (drag) {
        const pointer = drag.stage.getRelativePointerPosition();
        if (!pointer) {
          return;
        }
        const delta = { x: pointer.x - drag.startPointer.x, y: pointer.y - drag.startPointer.y };
        const groupOrigin = manualGroupOrigin.current;
        if (groupOrigin && groupOrigin.size > 1) {
          const { patch, indicator } = computeManualDragPatch(
            drag.origin,
            delta,
            dragTargets(Array.from(groupOrigin.keys())),
            snapTolerance / viewScale,
          );
          const anchorStart = getShapeAnchor(drag.origin);
          const anchorNow = getShapeAnchor({ ...drag.origin, ...patch } as TShape);
          const dx = anchorNow.x - anchorStart.x;
          const dy = anchorNow.y - anchorStart.y;
          updateShape(drag.origin.id, patch);
          groupOrigin.forEach((originShape, id) => {
            if (id === drag.origin.id) {
              return;
            }
            updateShape(id, translateShape(originShape, dx, dy));
          });
          setSnapIndicator(indicator);
          return;
        }

        const { patch, indicator } = computeManualDragPatch(
          drag.origin,
          delta,
          dragTargets([drag.origin.id]),
          snapTolerance / viewScale,
        );
        updateShape(drag.origin.id, patch);
        setSnapIndicator(indicator);
        return;
      }

      const marquee = marqueeDrag.current;
      if (!marquee) {
        return;
      }
      const pointer = marquee.stage.getRelativePointerPosition();
      if (!pointer) {
        return;
      }
      setMarqueeRect({
        x: Math.min(marquee.startPointer.x, pointer.x),
        y: Math.min(marquee.startPointer.y, pointer.y),
        width: Math.abs(pointer.x - marquee.startPointer.x),
        height: Math.abs(pointer.y - marquee.startPointer.y),
      });
    }

    function onWindowMouseUp(e: MouseEvent) {
      if (manualDrag.current) {
        manualDrag.current = null;
        manualGroupOrigin.current = null;
        useDocumentStore.temporal.getState().resume();
        setSnapIndicator(NO_SNAP);
        return;
      }

      const marquee = marqueeDrag.current;
      if (!marquee) {
        return;
      }
      marqueeDrag.current = null;
      setMarqueeRect(null);

      const clientDistance = Math.hypot(
        e.clientX - marquee.startClientPointer.x,
        e.clientY - marquee.startClientPointer.y,
      );
      if (clientDistance < MARQUEE_CLICK_THRESHOLD_PX) {
        selectionActions.clear();
        return;
      }

      const pointer = marquee.stage.getRelativePointerPosition();
      if (!pointer) {
        return;
      }
      const marqueeBounds = {
        x1: Math.min(marquee.startPointer.x, pointer.x),
        y1: Math.min(marquee.startPointer.y, pointer.y),
        x2: Math.max(marquee.startPointer.x, pointer.x),
        y2: Math.max(marquee.startPointer.y, pointer.y),
      };
      const ids = shapes
        .filter(shape => {
          const bounds = getShapeBounds(shape, components);
          return bounds !== null && areBoundsIntersecting(bounds, marqueeBounds);
        })
        .map(shape => shape.id);
      selectionActions.select(ids);
    }

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [dragTargets, snapTolerance, viewScale, updateShape, shapes, components]);

  return {
    registerNode,
    getNode,
    selectShape,
    onStageMouseDown,
    onDragStart,
    onDragMove,
    onDragEnd,
    onManualMouseDown,
    snapIndicator,
    marqueeRect,
  };
}
