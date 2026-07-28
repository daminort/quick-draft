import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { GeometryPanel } from '~/components/panels/GeometryPanel'
import { TextPanel } from '~/components/panels/TextPanel'
import { StylePanel } from '~/components/panels/StylePanel'

export function PropertiesPanel() {
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const shapes = useDocumentStore((state) => state.document.shapes)

  if (selectedIds.length !== 1) return null
  const shape = shapes.find((candidate) => candidate.id === selectedIds[0])
  if (!shape) return null

  return (
    <div
      style={{
        width: 220,
        padding: 12,
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <GeometryPanel shape={shape} />
      <TextPanel shape={shape} />
      <StylePanel shape={shape} />
    </div>
  )
}
