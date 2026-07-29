import { useCallback, useEffect, useRef, useState } from 'react';

import type { Shape, ShapeId, ShapePatch } from '~/types/document';

import { MARQUEE_CLICK_THRESHOLD_PX } from '~/constants/canvas';

import { collectSnapTargets, snapPoint, type SnapTargets } from '~/lib/snap';
import { getShapeBounds, boundsIntersect } from '~/lib/bounds';
import { getShapeAnchor, translateShape } from '~/lib/shapeTransform';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useSelectionStore } from '~/stores/useSelectionStore';
import { useToolStore } from '~/stores/useToolStore';
import { useUIStore } from '~/stores/useUIStore';
import { useViewStore } from '~/stores/useViewStore';

import type Konva from 'konva';

type Point = { x: number; y: number };
type SnapIndicator = { x: number | null; y: number | null };
const NO_SNAP: SnapIndicator = { x: null, y: null };
export type MarqueeRect = { x: number; y: number; width: number; height: number };

function computeDragResult(
  shape: Shape,
  node: Konva.Node,
  targets: SnapTargets,
  tolerance: number,
): { patch: ShapePatch; indicator: SnapIndicator } {
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
  shape: Shape,
  delta: Point,
  targets: SnapTargets,
  tolerance: number,
): { patch: ShapePatch; indicator: SnapIndicator } {
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

interface ManualDrag {
  origin: Shape;
  startPointer: Point;
  stage: Konva.Stage;
}

interface MarqueeDrag {
  stage: Konva.Stage;
  startPointer: Point;
  startClientPointer: Point;
}

export function useSelectTool() {
  const updateShape = useDocumentStore(state => state.updateShape);
  const shapes = useDocumentStore(state => state.document.shapes);
  const components = useDocumentStore(state => state.document.components);
  const guidesVisible = useUIStore(state => state.guidesVisible);
  const snapTolerance = useUIStore(state => state.snapTolerance);
  const activeTool = useToolStore(state => state.activeTool);
  const viewScale = useViewStore(state => state.scale);
  const select = useSelectionStore(state => state.select);
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const clearSelection = useSelectionStore(state => state.clear);
  const nodeRefs = useRef(new Map<ShapeId, Konva.Node>());
  const manualDrag = useRef<ManualDrag | null>(null);
  const marqueeDrag = useRef<MarqueeDrag | null>(null);
  const groupDragOrigin = useRef<Map<ShapeId, Shape> | null>(null);
  const groupDragAnchorId = useRef<ShapeId | null>(null);
  const manualGroupOrigin = useRef<Map<ShapeId, Shape> | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>(NO_SNAP);
  const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null);

  const snapshotSelection = useCallback((): Map<ShapeId, Shape> => {
    const snapshot = new Map<ShapeId, Shape>();
    for (const id of selectedIds) {
      const found = shapes.find(s => s.id === id);
      if (found) {
        snapshot.set(id, found);
      }
    }
    return snapshot;
  }, [selectedIds, shapes]);

  const registerNode = useCallback((id: ShapeId, node: Konva.Node | null) => {
    if (node) {
      nodeRefs.current.set(id, node);
    } else {
      nodeRefs.current.delete(id);
    }
  }, []);

  const getNode = useCallback((id: ShapeId) => nodeRefs.current.get(id) ?? null, []);

  const selectShape = useCallback((id: ShapeId) => select([id]), [select]);

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) {
        return;
      }
      if (activeTool !== 'select') {
        clearSelection();
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
    [activeTool, clearSelection],
  );

  const handleDragStart = useCallback(
    (shape: Shape) => {
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
    (excludeIds: ShapeId[]): SnapTargets => {
      const visibleShapes = guidesVisible ? shapes : shapes.filter(shape => shape.type !== 'guide');
      return collectSnapTargets(visibleShapes, { excludeIds });
    },
    [shapes, guidesVisible],
  );

  /**
   * Applies a drag frame for `shape`. When it's the anchor of an active multi-shape drag, only the
   * anchor snaps (against targets outside the whole selection) and every other selected shape is
   * translated by the same resulting delta, computed from each shape's drag-start snapshot so
   * per-frame patches never compound rounding error.
   */
  const applyDrag = useCallback(
    (shape: Shape, node: Konva.Node): SnapIndicator => {
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
        const anchorNow = getShapeAnchor({ ...anchorOrigin, ...patch } as Shape);
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

  const handleDragMove = useCallback(
    (shape: Shape, node: Konva.Node) => {
      setSnapIndicator(applyDrag(shape, node));
    },
    [applyDrag],
  );

  const handleDragEnd = useCallback(
    (shape: Shape, node: Konva.Node) => {
      applyDrag(shape, node);
      groupDragOrigin.current = null;
      groupDragAnchorId.current = null;
      useDocumentStore.temporal.getState().resume();
      setSnapIndicator(NO_SNAP);
    },
    [applyDrag],
  );

  const handleManualMouseDown = useCallback(
    (shape: Shape, e: Konva.KonvaEventObject<MouseEvent>) => {
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
    function handleWindowMouseMove() {
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
          const anchorNow = getShapeAnchor({ ...drag.origin, ...patch } as Shape);
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

    function handleWindowMouseUp(e: MouseEvent) {
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
        clearSelection();
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
          return bounds !== null && boundsIntersect(bounds, marqueeBounds);
        })
        .map(shape => shape.id);
      select(ids);
    }

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    dragTargets,
    snapTolerance,
    viewScale,
    updateShape,
    shapes,
    components,
    select,
    clearSelection,
  ]);

  return {
    registerNode,
    getNode,
    selectShape,
    handleStageMouseDown,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleManualMouseDown,
    snapIndicator,
    marqueeRect,
  };
}
