import type { CSSProperties } from 'react'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { MIN_SCALE, MAX_SCALE } from '~/stores/useViewStore'

interface ZoomControlProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const buttonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  border: 'none',
  borderRadius: 4,
  background: 'transparent',
  cursor: 'pointer',
}

export function ZoomControl({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlProps) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 12,
        bottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 4,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        onClick={onZoomOut}
        disabled={scale <= MIN_SCALE}
        style={buttonStyle}
      >
        <MinusIcon size={14} />
      </button>
      <button
        type="button"
        title="Reset zoom to 100%"
        aria-label="Reset zoom to 100%"
        onClick={onReset}
        style={{ ...buttonStyle, width: 44, fontSize: 12 }}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        onClick={onZoomIn}
        disabled={scale >= MAX_SCALE}
        style={buttonStyle}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  )
}
