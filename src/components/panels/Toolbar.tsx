import { useState } from 'react'
import { Flex, IconButton } from '@radix-ui/themes'
import {
  MousePointer2,
  PencilLine,
  Square,
  Circle,
  LoaderCircle,
  Type,
  PanelLeftRightDashed,
  Ruler,
  RulerDimensionLine,
  Trash2,
  Settings,
  Layers,
  Printer,
} from 'lucide-react'
import { useToolStore, type Tool } from '~/stores/useToolStore'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { useUIStore } from '~/stores/useUIStore'
import { ConfirmDialog } from '~/components/ui/ConfirmDialog'
import { FileActions } from '~/components/panels/FileActions'

const TOOLS: { tool: Tool; label: string; Icon: typeof MousePointer2 }[] = [
  { tool: 'select', label: 'Select', Icon: MousePointer2 },
  { tool: 'line', label: 'Line (L)', Icon: PencilLine },
  { tool: 'rect', label: 'Rectangle (R)', Icon: Square },
  { tool: 'circle', label: 'Circle (C)', Icon: Circle },
  { tool: 'arc', label: 'Arc (A)', Icon: LoaderCircle },
  { tool: 'text', label: 'Text (T)', Icon: Type },
  { tool: 'guide', label: 'Guide (G) — click: horizontal, Shift+click: vertical', Icon: PanelLeftRightDashed },
  {
    tool: 'dimension',
    label: 'Dimension (D) — click two points, then drag to set direction and offset',
    Icon: RulerDimensionLine,
  },
  {
    tool: 'ruler',
    label:
      'Ruler (U) — click two points to measure; hold Shift to lock to horizontal/vertical; type a number + Enter to set an exact length',
    Icon: Ruler,
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
          <Layers size={20} />
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
          <Printer size={20} />
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
          <Settings size={20} />
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
          <Trash2 size={20} />
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
