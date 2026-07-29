import { useEffect, useRef } from 'react'
import type { Shape } from '~/types/document'
import { TEXT_EDIT_OVERLAY_PADDING_PX } from '~/constants/canvas'

interface TextEditOverlayProps {
  shape: Extract<Shape, { type: 'text' }>
  scale: number
  offsetX: number
  offsetY: number
  onChange: (text: string) => void
  onCommit: () => void
  onCancel: () => void
}

export function TextEditOverlay({
  shape,
  scale,
  offsetX,
  offsetY,
  onChange,
  onCommit,
  onCancel,
}: TextEditOverlayProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Seeded once on mount so re-renders triggered by our own onChange calls don't reset the
  // caret position while the user is typing.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.textContent = shape.text
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fontStyle =
    [shape.bold && 'bold', shape.italic && 'italic'].filter(Boolean).join(' ') || 'normal'

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onInput={(e) => onChange(e.currentTarget.textContent ?? '')}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          onCommit()
        }
      }}
      style={{
        position: 'absolute',
        left: offsetX + shape.x * scale - TEXT_EDIT_OVERLAY_PADDING_PX,
        top: offsetY + shape.y * scale - TEXT_EDIT_OVERLAY_PADDING_PX,
        padding: TEXT_EDIT_OVERLAY_PADDING_PX,
        minWidth: '1em',
        fontFamily: shape.fontFamily,
        fontSize: shape.fontSize * scale,
        fontWeight: shape.bold ? 'bold' : 'normal',
        fontStyle,
        textAlign: shape.align,
        color: shape.fill,
        lineHeight: 1,
        whiteSpace: 'pre',
        outline: '1px dashed var(--accent-9)',
        background: 'var(--color-background)',
        cursor: 'text',
      }}
    />
  )
}
