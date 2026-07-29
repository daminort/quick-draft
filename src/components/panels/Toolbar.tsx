import { useState } from 'react'
import { Flex, IconButton } from '@radix-ui/themes'
import { CursorIcon } from '@phosphor-icons/react/dist/csr/Cursor'
import { LineSegmentIcon } from '@phosphor-icons/react/dist/csr/LineSegment'
import { RectangleIcon } from '@phosphor-icons/react/dist/csr/Rectangle'
import { CircleIcon } from '@phosphor-icons/react/dist/csr/Circle'
import { CircleNotchIcon } from '@phosphor-icons/react/dist/csr/CircleNotch'
import { TextTIcon } from '@phosphor-icons/react/dist/csr/TextT'
import { RulerIcon } from '@phosphor-icons/react/dist/csr/Ruler'
import { PencilRulerIcon } from '@phosphor-icons/react/dist/csr/PencilRuler'
import { ArrowsOutLineHorizontalIcon } from '@phosphor-icons/react/dist/csr/ArrowsOutLineHorizontal'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { GearIcon } from '@phosphor-icons/react/dist/csr/Gear'
import { StackIcon } from '@phosphor-icons/react/dist/csr/Stack'
import { PrinterIcon } from '@phosphor-icons/react/dist/csr/Printer'
import { useToolStore, type Tool } from '~/stores/useToolStore'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useUIStore } from '~/stores/useUIStore'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'
import { FileActions } from '~/components/panels/FileActions'

const TOOLS: { tool: Tool; label: string; Icon: typeof CursorIcon }[] = [
  { tool: 'select', label: 'Select', Icon: CursorIcon },
  { tool: 'line', label: 'Line (L)', Icon: LineSegmentIcon },
  { tool: 'rect', label: 'Rectangle (R)', Icon: RectangleIcon },
  { tool: 'circle', label: 'Circle (C)', Icon: CircleIcon },
  { tool: 'arc', label: 'Arc (A)', Icon: CircleNotchIcon },
  { tool: 'text', label: 'Text (T)', Icon: TextTIcon },
  { tool: 'guide', label: 'Guide (G) — click: horizontal, Shift+click: vertical', Icon: RulerIcon },
  {
    tool: 'dimension',
    label: 'Dimension (D) — click two points, then drag to set direction and offset',
    Icon: ArrowsOutLineHorizontalIcon,
  },
  {
    tool: 'ruler',
    label:
      'Ruler (U) — click two points to measure; hold Shift to lock to horizontal/vertical; type a number + Enter to set an exact length',
    Icon: PencilRulerIcon,
  },
]

// IconButton's `ghost` variant sizes itself to fit-content (content-box + padding) while every
// other variant uses a fixed border-box height, so switching variant on activation shifts the
// button's box. Keep `variant="ghost"` at all times — its own fit-content sizing is identical in
// both states — and fake the "soft" active look with an inline background instead of switching
// variant, so nothing shifts.
const ACTIVE_TOOL_BUTTON_STYLE = { backgroundColor: 'var(--accent-a3)' }

export function Toolbar() {
  const activeTool = useToolStore((state) => state.activeTool)
  const setTool = useToolStore((state) => state.setTool)
  const clearDocument = useDocumentStore((state) => state.clear)
  const clearSelection = useSelectionStore((state) => state.clear)
  const settingsOpen = useUIStore((state) => state.settingsOpen)
  const toggleSettings = useUIStore((state) => state.toggleSettings)
  const libraryOpen = useUIStore((state) => state.libraryOpen)
  const toggleLibrary = useUIStore((state) => state.toggleLibrary)
  const openPrint = useUIStore((state) => state.openPrint)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const handleClearConfirmed = () => {
    clearDocument()
    clearSelection()
    setClearDialogOpen(false)
  }

  return (
    <Flex direction="column" gap="4" p="3" style={{ borderRight: '1px solid var(--gray-a5)' }}>
      {TOOLS.map(({ tool, label, Icon }) => (
        <IconButton
          key={tool}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={activeTool === tool}
          variant="ghost"
          size="3"
          style={activeTool === tool ? ACTIVE_TOOL_BUTTON_STYLE : undefined}
          onClick={() => setTool(tool)}
        >
          <Icon size={20} />
        </IconButton>
      ))}

      <Flex direction="column" gap="3" mt="auto">
        <IconButton
          type="button"
          title="Component library"
          aria-label="Component library"
          aria-pressed={libraryOpen}
          variant="ghost"
          size="3"
          style={libraryOpen ? ACTIVE_TOOL_BUTTON_STYLE : undefined}
          onClick={toggleLibrary}
        >
          <StackIcon size={20} />
        </IconButton>

        <FileActions />

        <IconButton
          type="button"
          title="Print"
          aria-label="Print"
          variant="ghost"
          size="3"
          onClick={openPrint}
        >
          <PrinterIcon size={20} />
        </IconButton>

        <IconButton
          type="button"
          title="Settings"
          aria-label="Settings"
          aria-pressed={settingsOpen}
          variant="ghost"
          size="3"
          style={settingsOpen ? ACTIVE_TOOL_BUTTON_STYLE : undefined}
          onClick={toggleSettings}
        >
          <GearIcon size={20} />
        </IconButton>

        <IconButton
          type="button"
          title="Clear canvas"
          aria-label="Clear canvas"
          variant="ghost"
          color="red"
          size="3"
          onClick={() => setClearDialogOpen(true)}
        >
          <TrashIcon size={20} />
        </IconButton>
      </Flex>

      <ConfirmDialog
        open={clearDialogOpen}
        title="Clear canvas"
        message="This will remove all shapes from the canvas."
        confirmLabel="Clear"
        onConfirm={handleClearConfirmed}
        onCancel={() => setClearDialogOpen(false)}
      />
    </Flex>
  )
}
