import { useDocumentStore } from '../../stores/useDocumentStore'
import { useSelectionStore } from '../../stores/useSelectionStore'

export function StylePanel() {
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const shapes = useDocumentStore((state) => state.document.shapes)
  const updateShape = useDocumentStore((state) => state.updateShape)

  if (selectedIds.length !== 1) return null
  const shape = shapes.find((candidate) => candidate.id === selectedIds[0])
  if (!shape || !('style' in shape)) return null

  return (
    <div style={{ width: 220, padding: 12, borderLeft: '1px solid #ddd' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Stroke width
        <input
          type="number"
          min={1}
          value={shape.style.strokeWidth}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (Number.isFinite(value) && value > 0) {
              updateShape(shape.id, { style: { ...shape.style, strokeWidth: value } })
            }
          }}
        />
      </label>
    </div>
  )
}
