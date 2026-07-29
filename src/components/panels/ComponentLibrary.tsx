import { useRef, useState, type ChangeEvent } from 'react'
import { Stage, Layer, Group } from 'react-konva'
import { Flex, Text, Button, IconButton } from '@radix-ui/themes'
import { Trash2, Download, Upload } from 'lucide-react'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer'
import { noopShapeInteraction } from '~/components/canvas/shapes/ShapeInteraction'
import { getUnionBounds } from '~/lib/bounds'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'
import {
  exportComponentLibraryToJsonFile,
  importComponentLibraryFromJsonFile,
} from '~/lib/persistence/fileIO'
import type { ComponentDef } from '~/types/document'
import { COMPONENT_DRAG_MIME_TYPE } from '~/constants/fileIO'
import {
  COMPONENT_PREVIEW_SIZE as PREVIEW_SIZE,
  COMPONENT_PREVIEW_PADDING as PREVIEW_PADDING,
  LARGE_VIEW_BOUNDS as PREVIEW_VIEW_BOUNDS,
} from '~/constants/componentLibrary'

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

export function ComponentLibrary() {
  const components = useDocumentStore((state) => state.document.components)
  const removeComponent = useDocumentStore((state) => state.removeComponent)
  const importComponents = useDocumentStore((state) => state.importComponents)
  const entries = Object.values(components)
  const [deleteTarget, setDeleteTarget] = useState<ComponentDef | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleDeleteConfirmed = () => {
    if (!deleteTarget) return
    const replacedBy = removeComponent(deleteTarget.id)
    // Swap any selected instance of the deleted component for the freestanding shapes it became.
    const selectedIds = useSelectionStore.getState().selectedIds
    const nextSelection = selectedIds.flatMap((id) => replacedBy[id] ?? [id])
    useSelectionStore.getState().select(nextSelection)
    setDeleteTarget(null)
  }

  const handleImportLibrary = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const defs = await importComponentLibraryFromJsonFile(file)
      importComponents(defs)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to import the library.')
    }
  }

  return (
    <Flex
      direction="column"
      gap="4"
      width="220px"
      p="3"
      style={{ borderLeft: '1px solid var(--gray-a5)', overflowY: 'auto' }}
    >
      <Text as="div" size="2" weight="bold">
        Component library
      </Text>

      <Flex gap="2">
        <Button
          type="button"
          variant="outline"
          size="1"
          style={{ flex: 1 }}
          disabled={entries.length === 0}
          onClick={() => exportComponentLibraryToJsonFile(components)}
        >
          <Download size={16} />
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          size="1"
          style={{ flex: 1 }}
          onClick={() => importInputRef.current?.click()}
        >
          <Upload size={16} />
          Import
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportLibrary}
          style={{ display: 'none' }}
        />
      </Flex>

      {entries.length === 0 && (
        <Text as="p" size="1" color="gray">
          Select two or more shapes and group them into a component to see it here.
        </Text>
      )}
      <Flex direction="column" gap="2">
        {entries.map((componentDef) => (
          <Flex
            key={componentDef.id}
            align="center"
            gap="2"
            p="1"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(COMPONENT_DRAG_MIME_TYPE, componentDef.id)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            title={`Drag onto the canvas to insert an instance of "${componentDef.name}"`}
            style={{
              border: '1px solid var(--gray-a5)',
              borderRadius: 'var(--radius-3)',
              cursor: 'grab',
            }}
          >
            <ComponentPreview componentDef={componentDef} components={components} />
            <Text
              size="2"
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {componentDef.name}
            </Text>
            <IconButton
              type="button"
              title={`Delete "${componentDef.name}" from the library`}
              aria-label={`Delete "${componentDef.name}" from the library`}
              variant="ghost"
              color="red"
              size="1"
              onClick={() => setDeleteTarget(componentDef)}
            >
              <Trash2 size={16} />
            </IconButton>
          </Flex>
        ))}
      </Flex>

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
    </Flex>
  )
}
