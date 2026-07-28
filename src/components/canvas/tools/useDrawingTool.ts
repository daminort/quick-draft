import { useCallback, useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useToolStore } from '~/stores/useToolStore'
import { useUIStore } from '~/stores/useUIStore'
import { useViewStore } from '~/stores/useViewStore'
import { collectSnapTargets, snapPoint } from '~/lib/snap'
import type { Shape, Style } from '~/types/document'

const DEFAULT_STYLE: Style = { stroke: '#1a1a1a', strokeWidth: 1 }
const DEFAULT_TEXT_COLOR = '#1a1a1a'

type Point = { x: number; y: number }
type ArcPhase = 'radius' | 'angle'
type SnapIndicator = { x: number | null; y: number | null }

const NO_SNAP: SnapIndicator = { x: null, y: null }

function getPointerPosition(stage: Konva.Stage): Point {
  return stage.getRelativePointerPosition() ?? { x: 0, y: 0 }
}

function angleBetween(center: Point, point: Point): number {
  return (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI
}

function hasSize(shape: Shape): boolean {
  switch (shape.type) {
    case 'line':
      return shape.x1 !== shape.x2 || shape.y1 !== shape.y2
    case 'rect':
      return shape.w > 0 && shape.h > 0
    case 'circle':
      return shape.r > 0
    case 'arc':
      return shape.r > 0
    default:
      return false
  }
}

export function useDrawingTool() {
  const activeTool = useToolStore((state) => state.activeTool)
  const setTool = useToolStore((state) => state.setTool)
  const doc = useDocumentStore((state) => state.document)
  const addShape = useDocumentStore((state) => state.addShape)
  const selectShape = useSelectionStore((state) => state.select)
  const guidesVisible = useUIStore((state) => state.guidesVisible)
  const snapTolerance = useUIStore((state) => state.snapTolerance)
  const viewScale = useViewStore((state) => state.scale)
  const [draftShape, setDraftShape] = useState<Shape | null>(null)
  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>(NO_SNAP)
  const startPoint = useRef<Point | null>(null)
  const arcPhase = useRef<ArcPhase | null>(null)

  useEffect(() => {
    setDraftShape(null)
    setSnapIndicator(NO_SNAP)
    startPoint.current = null
    arcPhase.current = null
  }, [activeTool])

  const snapCursor = useCallback(
    (point: Point): Point => {
      const shapes = guidesVisible
        ? doc.shapes
        : doc.shapes.filter((shape) => shape.type !== 'guide')
      const result = snapPoint(point, collectSnapTargets(shapes), snapTolerance / viewScale)
      setSnapIndicator({
        x: result.snappedX ? result.x : null,
        y: result.snappedY ? result.y : null,
      })
      return { x: result.x, y: result.y }
    },
    [doc.shapes, guidesVisible, snapTolerance, viewScale],
  )

  const handleArcMouseDown = useCallback(
    (point: Point) => {
      if (!arcPhase.current) {
        const id = crypto.randomUUID()
        arcPhase.current = 'radius'
        setDraftShape({
          id,
          type: 'arc',
          cx: point.x,
          cy: point.y,
          r: 0,
          startAngle: 0,
          endAngle: 359.999,
          style: DEFAULT_STYLE,
        })
        return
      }

      setDraftShape((current) => {
        if (!current || current.type !== 'arc') return current

        if (arcPhase.current === 'radius') {
          const r = Math.hypot(point.x - current.cx, point.y - current.cy)
          const startAngle = angleBetween({ x: current.cx, y: current.cy }, point)
          arcPhase.current = 'angle'
          return { ...current, r, startAngle, endAngle: startAngle }
        }

        const endAngle = angleBetween({ x: current.cx, y: current.cy }, point)
        const finalShape = { ...current, endAngle }
        if (hasSize(finalShape)) {
          addShape(finalShape)
        }
        arcPhase.current = null
        return null
      })
    },
    [addShape],
  )

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'select') return
      const stage = e.target.getStage()
      if (!stage) return
      const point = snapCursor(getPointerPosition(stage))

      if (activeTool === 'arc') {
        handleArcMouseDown(point)
        return
      }

      if (activeTool === 'text') {
        const id = crypto.randomUUID()
        addShape({
          id,
          type: 'text',
          x: point.x,
          y: point.y,
          text: 'Text',
          fontFamily: 'Arial',
          fontSize: 16,
          bold: false,
          italic: false,
          fill: DEFAULT_TEXT_COLOR,
        })
        selectShape([id])
        setTool('select')
        return
      }

      if (activeTool === 'guide') {
        const id = crypto.randomUUID()
        const orientation = e.evt.shiftKey ? 'v' : 'h'
        addShape({
          id,
          type: 'guide',
          orientation,
          position: orientation === 'v' ? point.x : point.y,
        })
        return
      }

      const id = crypto.randomUUID()
      startPoint.current = point

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
    [activeTool, handleArcMouseDown, addShape, selectShape, setTool, snapCursor],
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (!stage) return
      const point = snapCursor(getPointerPosition(stage))

      if (activeTool === 'arc') {
        setDraftShape((current) => {
          if (!current || current.type !== 'arc' || !arcPhase.current) return current
          const center = { x: current.cx, y: current.cy }

          if (arcPhase.current === 'radius') {
            return { ...current, r: Math.hypot(point.x - center.x, point.y - center.y) }
          }

          return { ...current, endAngle: angleBetween(center, point) }
        })
        return
      }

      const start = startPoint.current
      if (!start) return

      setDraftShape((current) => {
        if (!current) return current
        if (current.type === 'line') {
          let x2 = point.x
          let y2 = point.y
          if (e.evt.shiftKey) {
            const dx = point.x - current.x1
            const dy = point.y - current.y1
            if (Math.abs(dx) > Math.abs(dy)) {
              y2 = current.y1
            } else {
              x2 = current.x1
            }
          }
          return { ...current, x2, y2 }
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
    },
    [activeTool, snapCursor],
  )

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'arc' || activeTool === 'guide') return

    setDraftShape((current) => {
      if (current && hasSize(current)) {
        addShape(current)
      }
      return null
    })
    startPoint.current = null
    setSnapIndicator(NO_SNAP)
  }, [activeTool, addShape])

  return {
    draftShape: activeTool === 'select' ? null : draftShape,
    snapIndicator,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}
