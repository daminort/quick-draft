import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export interface ContextMenuItem {
  label: string
  icon: ReactNode
  onClick: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node)) return
      onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 6,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        padding: 4,
        minWidth: 160,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={() => {
            item.onClick()
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            border: 'none',
            borderRadius: 4,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f2f2f2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
