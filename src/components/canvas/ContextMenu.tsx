import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Box, Flex, Button } from '@radix-ui/themes'

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
    <Box
      ref={menuRef}
      role="menu"
      p="2"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
        background: 'var(--color-panel-solid)',
        border: '1px solid var(--gray-a5)',
        borderRadius: 'var(--radius-3)',
        boxShadow: 'var(--shadow-5)',
        minWidth: 160,
      }}
    >
      <Flex direction="column" gap="1">
        {items.map((item) => (
          <Button
            key={item.label}
            type="button"
            role="menuitem"
            variant="ghost"
            color="gray"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => {
              item.onClick()
              onClose()
            }}
          >
            <Flex align="center" gap="2">
              {item.icon}
              {item.label}
            </Flex>
          </Button>
        ))}
      </Flex>
    </Box>
  )
}
