import { useEffect, useRef, useState } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useToolStore } from '~/stores/useToolStore'
import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer'
import { SelectionTransformer } from '~/components/canvas/SelectionTransformer'
import { useDrawingTool } from '~/components/canvas/tools/useDrawingTool'
import { useSelectTool } from '~/components/canvas/tools/useSelectTool'

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const staticLayerRef = useRef<Konva.Layer>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const shapes = useDocumentStore((state) => state.document.shapes)
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const activeTool = useToolStore((state) => state.activeTool)

  const drawingTool = useDrawingTool()
  const selectTool = useSelectTool()

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
    const layer = staticLayerRef.current
    if (!layer) return
    layer.clearCache()
    layer.cache()
    layer.batchDraw()
  }, [shapes])

  const isInteractive = activeTool === 'select'
  const selectedShape =
    selectedIds.length === 1 ? (shapes.find((shape) => shape.id === selectedIds[0]) ?? null) : null
  const selectedNode = selectedShape ? selectTool.getNode(selectedShape.id) : null

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={(e) => {
          selectTool.handleStageMouseDown(e)
          drawingTool.handleMouseDown(e)
        }}
        onMouseMove={drawingTool.handleMouseMove}
        onMouseUp={drawingTool.handleMouseUp}
      >
        <Layer ref={staticLayerRef}>
          {shapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              interactive={isInteractive}
              interaction={selectTool}
            />
          ))}
        </Layer>
        <Layer>
          {drawingTool.draftShape && (
            <ShapeRenderer
              shape={drawingTool.draftShape}
              interactive={false}
              interaction={selectTool}
            />
          )}
          <SelectionTransformer shape={selectedShape} node={selectedNode} />
        </Layer>
      </Stage>
    </div>
  )
}
