import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect } from 'react-konva'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useToolStore } from '~/stores/useToolStore'
import { useUIStore } from '~/stores/useUIStore'
import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer'
import { SelectionTransformer } from '~/components/canvas/SelectionTransformer'
import { ZoomControl } from '~/components/canvas/ZoomControl'
import { useDrawingTool } from '~/components/canvas/tools/useDrawingTool'
import { useSelectTool } from '~/components/canvas/tools/useSelectTool'
import { useCanvasZoom } from '~/components/canvas/tools/useCanvasZoom'
import { useCanvasPan } from '~/components/canvas/tools/useCanvasPan'
import { COMPONENT_DRAG_MIME } from '~/components/panels/ComponentLibrary'

const SNAP_INDICATOR_COLOR = '#ff3b8d'
const SNAP_POINT_SIZE = 5
const MARQUEE_STROKE_COLOR = '#2563eb'
const MARQUEE_FILL_COLOR = 'rgba(37, 99, 235, 0.1)'

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const staticLayerRef = useRef<Konva.Layer>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const shapes = useDocumentStore((state) => state.document.shapes)
  const components = useDocumentStore((state) => state.document.components)
  const removeShape = useDocumentStore((state) => state.removeShape)
  const addComponentInstance = useDocumentStore((state) => state.addComponentInstance)
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const select = useSelectionStore((state) => state.select)
  const clearSelection = useSelectionStore((state) => state.clear)
  const activeTool = useToolStore((state) => state.activeTool)
  const setTool = useToolStore((state) => state.setTool)
  const guidesVisible = useUIStore((state) => state.guidesVisible)
  const dimensionsVisible = useUIStore((state) => state.dimensionsVisible)

  const drawingTool = useDrawingTool()
  const selectTool = useSelectTool()
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
      if (e.key.toLowerCase() !== 'g') return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable)
        return
      setTool('guide')
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
    const componentId = e.dataTransfer.getData(COMPONENT_DRAG_MIME)
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

  function handleComponentDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes(COMPONENT_DRAG_MIME)) return
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
        }}
        onMouseMove={drawingTool.handleMouseMove}
        onMouseUp={drawingTool.handleMouseUp}
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
      <ZoomControl
        scale={zoom.scale}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        onReset={zoom.resetZoom}
      />
    </div>
  )
}
