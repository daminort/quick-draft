import { useCallback, useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useUIStore } from '~/stores/useUIStore'
import { useViewStore } from '~/stores/useViewStore'
import { collectSnapTargets, snapPoint, type SnapTargets } from '~/lib/snap'
import type { Shape, ShapeId, ShapePatch } from '~/types/document'

type Point = { x: number; y: number }
type SnapIndicator = { x: number | null; y: number | null }
const NO_SNAP: SnapIndicator = { x: null, y: null }

function computeDragResult(
  shape: Shape,
  node: Konva.Node,
  targets: SnapTargets,
  tolerance: number,
): { patch: ShapePatch; indicator: SnapIndicator } {
  switch (shape.type) {
    case 'rect':
    case 'text': {
      const snapped = snapPoint({ x: node.x(), y: node.y() }, targets, tolerance)
      return {
        patch: { x: snapped.x, y: snapped.y },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      }
    }
    case 'circle': {
      const snapped = snapPoint({ x: node.x(), y: node.y() }, targets, tolerance)
      return {
        patch: { cx: snapped.x, cy: snapped.y },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      }
    }
    case 'line': {
      const snapped = snapPoint({ x: node.x(), y: node.y() }, targets, tolerance)
      const dx = snapped.x - shape.x1
      const dy = snapped.y - shape.y1
      return {
        patch: { x1: snapped.x, y1: snapped.y, x2: shape.x2 + dx, y2: shape.y2 + dy },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      }
    }
    case 'guide': {
      if (shape.orientation === 'v') {
        const snapped = snapPoint({ x: node.x(), y: 0 }, targets, tolerance)
        return {
          patch: { position: snapped.x },
          indicator: { x: snapped.snappedX ? snapped.x : null, y: null },
        }
      }
      const snapped = snapPoint({ x: 0, y: node.y() }, targets, tolerance)
      return {
        patch: { position: snapped.y },
        indicator: { x: null, y: snapped.snappedY ? snapped.y : null },
      }
    }
    default:
      return { patch: {}, indicator: NO_SNAP }
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
      )
      return {
        patch: { cx: snapped.x, cy: snapped.y },
        indicator: {
          x: snapped.snappedX ? snapped.x : null,
          y: snapped.snappedY ? snapped.y : null,
        },
      }
    }
    case 'dimension': {
      const projected = shape.axis === 'vertical' ? delta.x : delta.y
      return { patch: { offset: shape.offset + projected }, indicator: NO_SNAP }
    }
    default:
      return { patch: {}, indicator: NO_SNAP }
  }
}

interface ManualDrag {
  origin: Shape
  startPointer: Point
  stage: Konva.Stage
}

export function useSelectTool() {
  const updateShape = useDocumentStore((state) => state.updateShape)
  const shapes = useDocumentStore((state) => state.document.shapes)
  const guidesVisible = useUIStore((state) => state.guidesVisible)
  const snapTolerance = useUIStore((state) => state.snapTolerance)
  const viewScale = useViewStore((state) => state.scale)
  const select = useSelectionStore((state) => state.select)
  const clearSelection = useSelectionStore((state) => state.clear)
  const nodeRefs = useRef(new Map<ShapeId, Konva.Node>())
  const manualDrag = useRef<ManualDrag | null>(null)
  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>(NO_SNAP)

  const registerNode = useCallback((id: ShapeId, node: Konva.Node | null) => {
    if (node) {
      nodeRefs.current.set(id, node)
    } else {
      nodeRefs.current.delete(id)
    }
  }, [])

  const getNode = useCallback((id: ShapeId) => nodeRefs.current.get(id) ?? null, [])

  const selectShape = useCallback((id: ShapeId) => select([id]), [select])

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        clearSelection()
      }
    },
    [clearSelection],
  )

  const handleDragStart = useCallback(
    (shape: Shape) => {
      selectShape(shape.id)
      useDocumentStore.temporal.getState().pause()
    },
    [selectShape],
  )

  const dragTargets = useCallback(
    (excludeId: ShapeId): SnapTargets => {
      const visibleShapes = guidesVisible
        ? shapes
        : shapes.filter((shape) => shape.type !== 'guide')
      return collectSnapTargets(visibleShapes, { excludeId })
    },
    [shapes, guidesVisible],
  )

  const handleDragMove = useCallback(
    (shape: Shape, node: Konva.Node) => {
      const { patch, indicator } = computeDragResult(
        shape,
        node,
        dragTargets(shape.id),
        snapTolerance / viewScale,
      )
      updateShape(shape.id, patch)
      setSnapIndicator(indicator)
    },
    [updateShape, dragTargets, snapTolerance, viewScale],
  )

  const handleDragEnd = useCallback(
    (shape: Shape, node: Konva.Node) => {
      const { patch } = computeDragResult(
        shape,
        node,
        dragTargets(shape.id),
        snapTolerance / viewScale,
      )
      updateShape(shape.id, patch)
      useDocumentStore.temporal.getState().resume()
      setSnapIndicator(NO_SNAP)
    },
    [updateShape, dragTargets, snapTolerance, viewScale],
  )

  const handleManualMouseDown = useCallback(
    (shape: Shape, e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      const pointer = stage?.getRelativePointerPosition()
      if (!stage || !pointer) return
      manualDrag.current = { origin: shape, startPointer: pointer, stage }
      selectShape(shape.id)
      useDocumentStore.temporal.getState().pause()
    },
    [selectShape],
  )

  useEffect(() => {
    function handleWindowMouseMove() {
      const drag = manualDrag.current
      if (!drag) return
      const pointer = drag.stage.getRelativePointerPosition()
      if (!pointer) return
      const delta = { x: pointer.x - drag.startPointer.x, y: pointer.y - drag.startPointer.y }
      const { patch, indicator } = computeManualDragPatch(
        drag.origin,
        delta,
        dragTargets(drag.origin.id),
        snapTolerance / viewScale,
      )
      updateShape(drag.origin.id, patch)
      setSnapIndicator(indicator)
    }

    function handleWindowMouseUp() {
      if (!manualDrag.current) return
      manualDrag.current = null
      useDocumentStore.temporal.getState().resume()
      setSnapIndicator(NO_SNAP)
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [dragTargets, snapTolerance, viewScale, updateShape])

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
  }
}
