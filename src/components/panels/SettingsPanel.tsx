import { useState } from 'react'
import { UnitsControl } from '~/components/panels/UnitsControl'
import { useUIStore } from '~/stores/useUIStore'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'

export function SettingsPanel() {
  const guidesVisible = useUIStore((state) => state.guidesVisible)
  const toggleGuidesVisible = useUIStore((state) => state.toggleGuidesVisible)
  const snapTolerance = useUIStore((state) => state.snapTolerance)
  const setSnapTolerance = useUIStore((state) => state.setSnapTolerance)
  const showDimensionUnit = useUIStore((state) => state.showDimensionUnit)
  const toggleShowDimensionUnit = useUIStore((state) => state.toggleShowDimensionUnit)
  const dimensionsVisible = useUIStore((state) => state.dimensionsVisible)
  const toggleDimensionsVisible = useUIStore((state) => state.toggleDimensionsVisible)
  const clearGuides = useDocumentStore((state) => state.clearGuides)
  const [deleteGuidesDialogOpen, setDeleteGuidesDialogOpen] = useState(false)

  const handleDeleteGuidesConfirmed = () => {
    clearGuides()
    setDeleteGuidesDialogOpen(false)
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
      }}
    >
      <h2 style={{ fontSize: 14, margin: 0 }}>Settings</h2>
      <UnitsControl />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 13, margin: 0 }}>Guides</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={guidesVisible} onChange={toggleGuidesVisible} />
          Show guides
        </label>
        <button
          type="button"
          onClick={() => setDeleteGuidesDialogOpen(true)}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            borderRadius: 6,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Delete all guides
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 13, margin: 0 }}>Snapping</h3>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Snap tolerance (px)
          <input
            type="number"
            min={0}
            value={snapTolerance}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (Number.isFinite(value)) setSnapTolerance(value)
            }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 13, margin: 0 }}>Dimensions</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={dimensionsVisible} onChange={toggleDimensionsVisible} />
          Show dimensions
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={showDimensionUnit} onChange={toggleShowDimensionUnit} />
          Show unit
        </label>
      </div>

      <ConfirmDialog
        open={deleteGuidesDialogOpen}
        title="Delete all guides"
        message="This will remove every guide from the canvas."
        confirmLabel="Delete"
        onConfirm={handleDeleteGuidesConfirmed}
        onCancel={() => setDeleteGuidesDialogOpen(false)}
      />
    </div>
  )
}
