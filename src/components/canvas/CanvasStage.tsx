import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect } from 'react-konva'
import type Konva from 'konva'
import { ArrowLineUpIcon } from '@phosphor-icons/react/dist/csr/ArrowLineUp'
import { ArrowLineDownIcon } from '@phosphor-icons/react/dist/csr/ArrowLineDown'
import { ArrowsOutLineHorizontalIcon } from '@phosphor-icons/react/dist/csr/ArrowsOutLineHorizontal'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useToolStore, type Tool } from '~/stores/useToolStore'
import { useUIStore } from '~/stores/useUIStore'
import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer'
import { SelectionTransformer } from '~/components/canvas/SelectionTransformer'
import { ZoomControl } from '~/components/canvas/ZoomControl'
import { ContextMenu } from '~/components/canvas/ContextMenu'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'
import { useDrawingTool } from '~/components/canvas/tools/useDrawingTool'
import { useRulerTool } from '~/components/canvas/tools/useRulerTool'
import { RulerOverlay } from '~/components/canvas/RulerOverlay'
import { CanvasRulers } from '~/components/canvas/RulerBar'
import { useSelectTool } from '~/components/canvas/tools/useSelectTool'
import { useCopyPasteTool } from '~/components/canvas/tools/useCopyPasteTool'
import { useCanvasZoom } from '~/components/canvas/tools/useCanvasZoom'
import { useCanvasPan } from '~/components/canvas/tools/useCanvasPan'
import type { ShapeId } from '~/types/document'
import { COMPONENT_DRAG_MIME_TYPE } from '~/constants/fileIO'
import {
  SNAP_INDICATOR_COLOR,
  SNAP_POINT_SIZE,
  MARQUEE_STROKE_COLOR,
  MARQUEE_FILL_COLOR,
} from '~/constants/canvas'

// Keyed by e.code (physical key position), not e.key, so the shortcut still matches when a
// non-Latin keyboard layout (e.g. Cyrillic) is active and e.key would report a different character.
const TOOL_HOTKEYS: Partial<Record<string, Tool>> = {
  KeyG: 'guide',
  KeyL: 'line',
  KeyR: 'rect',
  KeyC: 'circle',
  KeyA: 'arc',
  KeyT: 'text',
  KeyD: 'dimension',
  KeyU: 'ruler',
}

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const staticLayerRef = useRef<Konva.Layer>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const shapes = useDocumentStore((state) => state.document.shapes)
  const components = useDocumentStore((state) => state.document.components)
  const removeShape = useDocumentStore((state) => state.removeShape)
  const bringToFront = useDocumentStore((state) => state.bringToFront)
  const sendToBack = useDocumentStore((state) => state.sendToBack)
  const addComponentInstance = useDocumentStore((state) => state.addComponentInstance)
  const clearGuides = useDocumentStore((state) => state.clearGuides)
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const select = useSelectionStore((state) => state.select)
  const clearSelection = useSelectionStore((state) => state.clear)
  const activeTool = useToolStore((state) => state.activeTool)
  const setTool = useToolStore((state) => state.setTool)
  const guidesVisible = useUIStore((state) => state.guidesVisible)
  const dimensionsVisible = useUIStore((state) => state.dimensionsVisible)
  const toggleDimensionsVisible = useUIStore((state) => state.toggleDimensionsVisible)
  const rulerVisible = useUIStore((state) => state.rulerVisible)
  const rulerGuidesVisible = useUIStore((state) => state.rulerGuidesVisible)
  const documentScale = useDocumentStore((state) => state.document.scale)
  const documentUnits = useDocumentStore((state) => state.document.units)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    shapeId: ShapeId
  } | null>(null)
  const [emptyContextMenu, setEmptyContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [deleteGuidesDialogOpen, setDeleteGuidesDialogOpen] = useState(false)

  const drawingTool = useDrawingTool()
  const rulerTool = useRulerTool()
  const selectTool = useSelectTool()
  const copyPasteTool = useCopyPasteTool()
  const zoom = useCanvasZoom(size)
  const pan = useCanvasPan()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tool = TOOL_HOTKEYS[e.code]
      if (!tool) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable)
        return
      setTool(tool)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setTool])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable)
        return
      if (selectedIds.length === 0) return
      e.preventDefault()
      selectedIds.forEach((id) => removeShape(id))
      clearSelection()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, removeShape, clearSelection])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'KeyZ') return
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable)
        return
      e.preventDefault()
      useDocumentStore.temporal.getState().undo()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable)
        return
      setTool('select')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setTool])

  const visibleShapes = shapes.filter(
    (shape) =>
      (guidesVisible || shape.type !== 'guide') &&
      (dimensionsVisible || shape.type !== 'dimension'),
  )

  useEffect(() => {
    const layer = staticLayerRef.current
    if (!layer) return
    layer.clearCache()
    layer.cache()
    layer.batchDraw()
  }, [visibleShapes, selectedIds])

  const isInteractive = activeTool === 'select'
  const selectedShape =
    selectedIds.length === 1 ? (shapes.find((shape) => shape.id === selectedIds[0]) ?? null) : null
  const selectedNode = selectedShape ? selectTool.getNode(selectedShape.id) : null

  const snapIndicator =
    drawingTool.snapIndicator.x !== null || drawingTool.snapIndicator.y !== null
      ? drawingTool.snapIndicator
      : selectTool.snapIndicator

  const viewBounds = {
    left: -zoom.x / zoom.scale,
    top: -zoom.y / zoom.scale,
    right: (size.width - zoom.x) / zoom.scale,
    bottom: (size.height - zoom.y) / zoom.scale,
  }

  function handleComponentDrop(e: React.DragEvent<HTMLDivElement>) {
    const componentId = e.dataTransfer.getData(COMPONENT_DRAG_MIME_TYPE)
    if (!componentId || !components[componentId]) return
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left - zoom.x) / zoom.scale
    const y = (e.clientY - rect.top - zoom.y) / zoom.scale
    const instanceId = addComponentInstance(componentId, x, y)
    // Deferred: the instance's Konva node registers on mount, one render after this one — selecting
    // it a tick later (instead of in the same batch) lets the Transformer find it immediately.
    setTimeout(() => select([instanceId]), 0)
  }

  function handleContextMenu(e: Konva.KonvaEventObject<PointerEvent>) {
    e.evt.preventDefault()
    if (!isInteractive) return
    const stage = e.target.getStage()
    if (!stage) return
    if (e.target === stage) {
      setContextMenu(null)
      setEmptyContextMenu({ x: e.evt.clientX, y: e.evt.clientY })
      return
    }
    const shapeId = e.target.id()
    if (!shapeId) return
    select([shapeId])
    setEmptyContextMenu(null)
    setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, shapeId })
  }

  function handleComponentDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes(COMPONENT_DRAG_MIME_TYPE)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  return (
    <div
      ref={containerRef}
      onDrop={handleComponentDrop}
      onDragOver={handleComponentDragOver}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: pan.isPanning ? 'grabbing' : undefined,
      }}
    >
      <Stage
        width={size.width}
        height={size.height}
        scaleX={zoom.scale}
        scaleY={zoom.scale}
        x={zoom.x}
        y={zoom.y}
        onWheel={zoom.handleWheel}
        onMouseDown={(e) => {
          if (pan.handleMouseDown(e)) return
          selectTool.handleStageMouseDown(e)
          drawingTool.handleMouseDown(e)
          rulerTool.handleMouseDown(e)
        }}
        onMouseMove={(e) => {
          drawingTool.handleMouseMove(e)
          rulerTool.handleMouseMove(e)
          copyPasteTool.handleMouseMove(e)
          if (rulerVisible && rulerGuidesVisible) {
            setCursorPos(e.target.getStage()?.getPointerPosition() ?? null)
          }
        }}
        onMouseLeave={() => setCursorPos(null)}
        onMouseUp={drawingTool.handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <Layer ref={staticLayerRef}>
          {visibleShapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              interactive={isInteractive}
              interaction={selectTool}
              viewBounds={viewBounds}
              selected={selectedIds.includes(shape.id)}
            />
          ))}
        </Layer>
        <Layer>
          {drawingTool.draftShape && (
            <ShapeRenderer
              shape={drawingTool.draftShape}
              interactive={false}
              interaction={selectTool}
              viewBounds={viewBounds}
            />
          )}
          <SelectionTransformer shape={selectedShape} node={selectedNode} />
          {rulerTool.draftRuler && <RulerOverlay ruler={rulerTool.draftRuler} scale={zoom.scale} />}
          {snapIndicator.x !== null && (
            <Line
              points={[snapIndicator.x, viewBounds.top, snapIndicator.x, viewBounds.bottom]}
              stroke={SNAP_INDICATOR_COLOR}
              strokeWidth={1 / zoom.scale}
              dash={[4 / zoom.scale, 4 / zoom.scale]}
              listening={false}
            />
          )}
          {snapIndicator.y !== null && (
            <Line
              points={[viewBounds.left, snapIndicator.y, viewBounds.right, snapIndicator.y]}
              stroke={SNAP_INDICATOR_COLOR}
              strokeWidth={1 / zoom.scale}
              dash={[4 / zoom.scale, 4 / zoom.scale]}
              listening={false}
            />
          )}
          {snapIndicator.x !== null && snapIndicator.y !== null && (
            <Rect
              x={snapIndicator.x}
              y={snapIndicator.y}
              width={SNAP_POINT_SIZE / zoom.scale}
              height={SNAP_POINT_SIZE / zoom.scale}
              offsetX={SNAP_POINT_SIZE / zoom.scale / 2}
              offsetY={SNAP_POINT_SIZE / zoom.scale / 2}
              stroke={SNAP_INDICATOR_COLOR}
              strokeWidth={1 / zoom.scale}
              listening={false}
            />
          )}
          {selectTool.marqueeRect && (
            <Rect
              x={selectTool.marqueeRect.x}
              y={selectTool.marqueeRect.y}
              width={selectTool.marqueeRect.width}
              height={selectTool.marqueeRect.height}
              stroke={MARQUEE_STROKE_COLOR}
              strokeWidth={1 / zoom.scale}
              fill={MARQUEE_FILL_COLOR}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
      {rulerVisible && (
        <CanvasRulers
          width={size.width}
          height={size.height}
          scale={zoom.scale}
          offsetX={zoom.x}
          offsetY={zoom.y}
          documentScale={documentScale}
          documentUnits={documentUnits}
          cursor={rulerGuidesVisible ? cursorPos : null}
        />
      )}
      <ZoomControl
        scale={zoom.scale}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        onReset={zoom.resetZoom}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: 'Bring to Front',
              icon: <ArrowLineUpIcon size={14} />,
              onClick: () => bringToFront(contextMenu.shapeId),
            },
            {
              label: 'Send to Back',
              icon: <ArrowLineDownIcon size={14} />,
              onClick: () => sendToBack(contextMenu.shapeId),
            },
          ]}
        />
      )}
      {emptyContextMenu && (
        <ContextMenu
          x={emptyContextMenu.x}
          y={emptyContextMenu.y}
          onClose={() => setEmptyContextMenu(null)}
          items={[
            {
              label: 'Toggle dimensions',
              icon: <ArrowsOutLineHorizontalIcon size={14} />,
              onClick: () => toggleDimensionsVisible(),
            },
            {
              label: 'Delete guides',
              icon: <TrashIcon size={14} />,
              onClick: () => setDeleteGuidesDialogOpen(true),
            },
          ]}
        />
      )}
      <ConfirmDialog
        open={deleteGuidesDialogOpen}
        title="Delete all guides"
        message="This will remove every guide from the canvas."
        confirmLabel="Delete"
        onConfirm={() => {
          clearGuides()
          setDeleteGuidesDialogOpen(false)
        }}
        onCancel={() => setDeleteGuidesDialogOpen(false)}
      />
    </div>
  )
}
