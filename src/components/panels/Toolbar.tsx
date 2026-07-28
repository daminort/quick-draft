import { CursorIcon } from '@phosphor-icons/react/dist/csr/Cursor'
import { LineSegmentIcon } from '@phosphor-icons/react/dist/csr/LineSegment'
import { RectangleIcon } from '@phosphor-icons/react/dist/csr/Rectangle'
import { CircleIcon } from '@phosphor-icons/react/dist/csr/Circle'
import { useToolStore, type Tool } from '../../stores/useToolStore'

const TOOLS: { tool: Tool; label: string; Icon: typeof CursorIcon }[] = [
  { tool: 'select', label: 'Select', Icon: CursorIcon },
  { tool: 'line', label: 'Line', Icon: LineSegmentIcon },
  { tool: 'rect', label: 'Rectangle', Icon: RectangleIcon },
  { tool: 'circle', label: 'Circle', Icon: CircleIcon },
]

export function Toolbar() {
  const activeTool = useToolStore((state) => state.activeTool)
  const setTool = useToolStore((state) => state.setTool)

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
    </div>
  )
}
