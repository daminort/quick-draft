import { useCallback, useRef, useState } from 'react'
import type Konva from 'konva'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useToolStore } from '../../../stores/useToolStore'
import type { Shape, Style } from '../../../types/document'

const DEFAULT_STYLE: Style = { stroke: '#1a1a1a', strokeWidth: 1 }

function getPointerPosition(stage: Konva.Stage) {
  return stage.getPointerPosition() ?? { x: 0, y: 0 }
}

function hasSize(shape: Shape): boolean {
  switch (shape.type) {
    case 'line':
      return shape.x1 !== shape.x2 || shape.y1 !== shape.y2
    case 'rect':
      return shape.w > 0 && shape.h > 0
    case 'circle':
      return shape.r > 0
    default:
      return false
  }
}

export function useDrawingTool() {
  const activeTool = useToolStore((state) => state.activeTool)
  const addShape = useDocumentStore((state) => state.addShape)
  const [draftShape, setDraftShape] = useState<Shape | null>(null)
  const startPoint = useRef<{ x: number; y: number } | null>(null)

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'select') return
      const stage = e.target.getStage()
      if (!stage) return
      const point = getPointerPosition(stage)
      startPoint.current = point
      const id = crypto.randomUUID()

      if (activeTool === 'line') {
        setDraftShape({
          id,
          type: 'line',
          x1: point.x,
          y1: point.y,
          x2: point.x,
          y2: point.y,
          style: DEFAULT_STYLE,
        })
      } else if (activeTool === 'rect') {
        setDraftShape({
          id,
          type: 'rect',
          x: point.x,
          y: point.y,
          w: 0,
          h: 0,
          rotation: 0,
          style: DEFAULT_STYLE,
        })
      } else if (activeTool === 'circle') {
        setDraftShape({ id, type: 'circle', cx: point.x, cy: point.y, r: 0, style: DEFAULT_STYLE })
      }
    },
    [activeTool],
  )

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const start = startPoint.current
    if (!start) return
    const stage = e.target.getStage()
    if (!stage) return
    const point = getPointerPosition(stage)

    setDraftShape((current) => {
      if (!current) return current
      if (current.type === 'line') {
        return { ...current, x2: point.x, y2: point.y }
      }
      if (current.type === 'rect') {
        return {
          ...current,
          x: Math.min(start.x, point.x),
          y: Math.min(start.y, point.y),
          w: Math.abs(point.x - start.x),
          h: Math.abs(point.y - start.y),
        }
      }
      if (current.type === 'circle') {
        return { ...current, r: Math.hypot(point.x - start.x, point.y - start.y) }
      }
      return current
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    setDraftShape((current) => {
      if (current && hasSize(current)) {
        addShape(current)
      }
      return null
    })
    startPoint.current = null
  }, [addShape])

  return {
    draftShape: activeTool === 'select' ? null : draftShape,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}
