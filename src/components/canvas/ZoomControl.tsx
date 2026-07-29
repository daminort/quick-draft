import { Flex, IconButton } from '@radix-ui/themes'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { MIN_SCALE, MAX_SCALE } from '~/constants/canvas'

interface ZoomControlProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function ZoomControl({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlProps) {
  return (
    <Flex
      align="center"
      gap="1"
      p="1"
      style={{
        position: 'absolute',
        right: 12,
        bottom: 12,
        background: 'var(--color-panel-solid)',
        border: '1px solid var(--gray-a5)',
        borderRadius: 'var(--radius-3)',
        boxShadow: 'var(--shadow-3)',
      }}
    >
      <IconButton
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        variant="ghost"
        color="gray"
        size="1"
        disabled={scale <= MIN_SCALE}
        onClick={onZoomOut}
      >
        <MinusIcon size={14} />
      </IconButton>
      <IconButton
        type="button"
        title="Reset zoom to 100%"
        aria-label="Reset zoom to 100%"
        variant="ghost"
        color="gray"
        size="1"
        style={{ width: 44 }}
        onClick={onReset}
      >
        {Math.round(scale * 100)}%
      </IconButton>
      <IconButton
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        variant="ghost"
        color="gray"
        size="1"
        disabled={scale >= MAX_SCALE}
        onClick={onZoomIn}
      >
        <PlusIcon size={14} />
      </IconButton>
    </Flex>
  )
}
