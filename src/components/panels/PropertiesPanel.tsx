import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { GeometryPanel } from '~/components/panels/GeometryPanel'
import { TextPanel } from '~/components/panels/TextPanel'
import { StylePanel } from '~/components/panels/StylePanel'
import { ComponentActions } from '~/components/panels/ComponentActions'

const PANEL_STYLE = {
  width: 220,
  padding: 12,
  borderLeft: '1px solid #ddd',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
}

export function PropertiesPanel() {
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const shapes = useDocumentStore((state) => state.document.shapes)

  if (selectedIds.length > 1) {
    return (
      <div style={PANEL_STYLE}>
        <ComponentActions />
      </div>
    )
  }

  if (selectedIds.length !== 1) return null
  const shape = shapes.find((candidate) => candidate.id === selectedIds[0])
  if (!shape) return null

  return (
    <div style={PANEL_STYLE}>
      <GeometryPanel shape={shape} />
      <TextPanel shape={shape} />
      <StylePanel shape={shape} />
    </div>
  )
}
