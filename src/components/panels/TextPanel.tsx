import { TextBIcon } from '@phosphor-icons/react/dist/csr/TextB'
import { TextItalicIcon } from '@phosphor-icons/react/dist/csr/TextItalic'
import { useDocumentStore } from '~/stores/useDocumentStore'
import type { Shape } from '~/types/document'

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana']

interface TextPanelProps {
  shape: Shape
}

export function TextPanel({ shape }: TextPanelProps) {
  const updateShape = useDocumentStore((state) => state.updateShape)

  if (shape.type !== 'text') return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Text
        <textarea
          rows={2}
          value={shape.text}
          onChange={(e) => updateShape(shape.id, { text: e.target.value })}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Font family
        <select
          value={shape.fontFamily}
          onChange={(e) => updateShape(shape.id, { fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Font size
        <input
          type="number"
          min={1}
          value={shape.fontSize}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (Number.isFinite(value) && value > 0) {
              updateShape(shape.id, { fontSize: value })
            }
          }}
        />
      </label>

      <div style={{ display: 'flex', gap: 4 }}>
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          aria-pressed={shape.bold}
          onClick={() => updateShape(shape.id, { bold: !shape.bold })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            border: 'none',
            borderRadius: 6,
            background: shape.bold ? '#dbe4ff' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <TextBIcon size={18} />
        </button>
        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          aria-pressed={shape.italic}
          onClick={() => updateShape(shape.id, { italic: !shape.italic })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            border: 'none',
            borderRadius: 6,
            background: shape.italic ? '#dbe4ff' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <TextItalicIcon size={18} />
        </button>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Color
        <input
          type="color"
          value={shape.fill}
          onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
        />
      </label>
    </div>
  )
}
