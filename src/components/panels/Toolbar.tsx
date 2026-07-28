import { useState } from 'react'
import { CursorIcon } from '@phosphor-icons/react/dist/csr/Cursor'
import { LineSegmentIcon } from '@phosphor-icons/react/dist/csr/LineSegment'
import { RectangleIcon } from '@phosphor-icons/react/dist/csr/Rectangle'
import { CircleIcon } from '@phosphor-icons/react/dist/csr/Circle'
import { CircleNotchIcon } from '@phosphor-icons/react/dist/csr/CircleNotch'
import { TextTIcon } from '@phosphor-icons/react/dist/csr/TextT'
import { RulerIcon } from '@phosphor-icons/react/dist/csr/Ruler'
import { ArrowsOutLineHorizontalIcon } from '@phosphor-icons/react/dist/csr/ArrowsOutLineHorizontal'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { GearIcon } from '@phosphor-icons/react/dist/csr/Gear'
import { useToolStore, type Tool } from '~/stores/useToolStore'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useUIStore } from '~/stores/useUIStore'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'

const TOOLS: { tool: Tool; label: string; Icon: typeof CursorIcon }[] = [
  { tool: 'select', label: 'Select', Icon: CursorIcon },
  { tool: 'line', label: 'Line', Icon: LineSegmentIcon },
  { tool: 'rect', label: 'Rectangle', Icon: RectangleIcon },
  { tool: 'circle', label: 'Circle', Icon: CircleIcon },
  { tool: 'arc', label: 'Arc', Icon: CircleNotchIcon },
  { tool: 'text', label: 'Text', Icon: TextTIcon },
  { tool: 'guide', label: 'Guide (G) — click: horizontal, Shift+click: vertical', Icon: RulerIcon },
  {
    tool: 'dimension',
    label: 'Dimension — click two points, then drag to set direction and offset',
    Icon: ArrowsOutLineHorizontalIcon,
  },
]

export function Toolbar() {
  const activeTool = useToolStore((state) => state.activeTool)
  const setTool = useToolStore((state) => state.setTool)
  const clearDocument = useDocumentStore((state) => state.clear)
  const clearSelection = useSelectionStore((state) => state.clear)
  const settingsOpen = useUIStore((state) => state.settingsOpen)
  const toggleSettings = useUIStore((state) => state.toggleSettings)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const handleClearConfirmed = () => {
    clearDocument()
    clearSelection()
    setClearDialogOpen(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 8,
        borderRight: '1px solid #ddd',
      }}
    >
      {TOOLS.map(({ tool, label, Icon }) => (
        <button
          key={tool}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={activeTool === tool}
          onClick={() => setTool(tool)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            border: 'none',
            borderRadius: 6,
            background: activeTool === tool ? '#dbe4ff' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <Icon size={20} />
        </button>
      ))}

      <button
        type="button"
        title="Settings"
        aria-label="Settings"
        aria-pressed={settingsOpen}
        onClick={toggleSettings}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          border: 'none',
          borderRadius: 6,
          background: settingsOpen ? '#dbe4ff' : 'transparent',
          cursor: 'pointer',
          marginTop: 'auto',
        }}
      >
        <GearIcon size={20} />
      </button>

      <button
        type="button"
        title="Clear canvas"
        aria-label="Clear canvas"
        onClick={() => setClearDialogOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <TrashIcon size={20} />
      </button>

      <ConfirmDialog
        open={clearDialogOpen}
        title="Clear canvas"
        message="This will remove all shapes from the canvas."
        confirmLabel="Clear"
        onConfirm={handleClearConfirmed}
        onCancel={() => setClearDialogOpen(false)}
      />
    </div>
  )
}
