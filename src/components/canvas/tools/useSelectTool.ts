import { useCallback, useRef } from 'react'
import type Konva from 'konva'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useSelectionStore } from '../../../stores/useSelectionStore'
import type { Shape, ShapeId, ShapePatch } from '../../../types/document'

function computeDragPatch(shape: Shape, node: Konva.Node): ShapePatch {
  switch (shape.type) {
    case 'rect':
      return { x: node.x(), y: node.y() }
    case 'circle':
      return { cx: node.x(), cy: node.y() }
    case 'line': {
      const dx = node.x() - shape.x1
      const dy = node.y() - shape.y1
      return { x1: node.x(), y1: node.y(), x2: shape.x2 + dx, y2: shape.y2 + dy }
    }
    default:
      return {}
  }
}

export function useSelectTool() {
  const updateShape = useDocumentStore((state) => state.updateShape)
  const select = useSelectionStore((state) => state.select)
  const clearSelection = useSelectionStore((state) => state.clear)
  const nodeRefs = useRef(new Map<ShapeId, Konva.Node>())

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
    (id: ShapeId) => {
      selectShape(id)
      useDocumentStore.temporal.getState().pause()
    },
    [selectShape],
  )

  const handleDragMove = useCallback(
    (shape: Shape, node: Konva.Node) => {
      updateShape(shape.id, computeDragPatch(shape, node))
    },
    [updateShape],
  )

  const handleDragEnd = useCallback(
    (shape: Shape, node: Konva.Node) => {
      updateShape(shape.id, computeDragPatch(shape, node))
      useDocumentStore.temporal.getState().resume()
    },
    [updateShape],
  )

  return {
    registerNode,
    getNode,
    selectShape,
    handleStageMouseDown,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}
