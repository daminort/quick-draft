import { useState } from 'react'
import { Stage, Layer, Group } from 'react-konva'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer'
import { noopShapeInteraction, type ViewBounds } from '~/components/canvas/shapes/ShapeInteraction'
import { getUnionBounds } from '~/lib/bounds'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'
import type { ComponentDef } from '~/types/document'

const PREVIEW_SIZE = 64
const PREVIEW_PADDING = 6
const PREVIEW_VIEW_BOUNDS: ViewBounds = { left: -1e5, top: -1e5, right: 1e5, bottom: 1e5 }

interface ComponentPreviewProps {
  componentDef: ComponentDef
  components: Record<string, ComponentDef>
}

function ComponentPreview({ componentDef, components }: ComponentPreviewProps) {
  const bounds = getUnionBounds(componentDef.shapes, components)
  const width = bounds ? Math.max(1, bounds.x2 - bounds.x1) : 1
  const height = bounds ? Math.max(1, bounds.y2 - bounds.y1) : 1
  const innerSize = PREVIEW_SIZE - PREVIEW_PADDING * 2
  const scale = bounds ? Math.min(innerSize / width, innerSize / height) : 1
  const offsetX = bounds ? PREVIEW_PADDING + (innerSize - width * scale) / 2 - bounds.x1 * scale : 0
  const offsetY = bounds
    ? PREVIEW_PADDING + (innerSize - height * scale) / 2 - bounds.y1 * scale
    : 0

  return (
    <Stage width={PREVIEW_SIZE} height={PREVIEW_SIZE} listening={false}>
      <Layer>
        <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          {componentDef.shapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              interactive={false}
              interaction={noopShapeInteraction}
              viewBounds={PREVIEW_VIEW_BOUNDS}
            />
          ))}
        </Group>
      </Layer>
    </Stage>
  )
}

/** Drag source id for HTML5 drag-and-drop of a library entry onto the canvas. */
export const COMPONENT_DRAG_MIME = 'application/x-quickdraft-component-id'

export function ComponentLibrary() {
  const components = useDocumentStore((state) => state.document.components)
  const removeComponent = useDocumentStore((state) => state.removeComponent)
  const entries = Object.values(components)
  const [deleteTarget, setDeleteTarget] = useState<ComponentDef | null>(null)

  const handleDeleteConfirmed = () => {
    if (!deleteTarget) return
    const replacedBy = removeComponent(deleteTarget.id)
    // Swap any selected instance of the deleted component for the freestanding shapes it became.
    const selectedIds = useSelectionStore.getState().selectedIds
    const nextSelection = selectedIds.flatMap((id) => replacedBy[id] ?? [id])
    useSelectionStore.getState().select(nextSelection)
    setDeleteTarget(null)
  }

  return (
    <div
      style={{
        width: 220,
        padding: 12,
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto',
      }}
    >
      <h2 style={{ fontSize: 14, margin: 0 }}>Component library</h2>
      {entries.length === 0 && (
        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
          Select two or more shapes and group them into a component to see it here.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((componentDef) => (
          <div
            key={componentDef.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(COMPONENT_DRAG_MIME, componentDef.id)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            title={`Drag onto the canvas to insert an instance of "${componentDef.name}"`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 6,
              border: '1px solid #ddd',
              borderRadius: 6,
              cursor: 'grab',
            }}
          >
            <ComponentPreview componentDef={componentDef} components={components} />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {componentDef.name}
            </span>
            <button
              type="button"
              title={`Delete "${componentDef.name}" from the library`}
              aria-label={`Delete "${componentDef.name}" from the library`}
              onClick={() => setDeleteTarget(componentDef)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                flexShrink: 0,
                border: 'none',
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete component"
        message={
          deleteTarget
            ? `This will remove "${deleteTarget.name}" from the library. Existing instances on the canvas will become independent, ungrouped shapes.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
