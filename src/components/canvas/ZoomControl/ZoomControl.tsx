import { Flex, IconButton } from '@radix-ui/themes';
import { Minus, Plus } from 'lucide-react';

import { MIN_SCALE, MAX_SCALE } from '~/constants/canvas';

type TZoomControlProps = {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function ZoomControl({ scale, onZoomIn, onZoomOut, onReset }: TZoomControlProps) {
  const isZoomOutDisabled = scale <= MIN_SCALE;
  const isZoomInDisabled = scale >= MAX_SCALE;
  const zoomPercentage = Math.round(scale * 100);
  const resetButtonStyle = { width: 44 };

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
        onClick={onZoomOut}
        disabled={isZoomOutDisabled}
        variant="ghost"
        color="gray"
        size="1"
      >
        <Minus size={14} />
      </IconButton>
      <IconButton
        type="button"
        title="Reset zoom to 100%"
        aria-label="Reset zoom to 100%"
        onClick={onReset}
        variant="ghost"
        color="gray"
        size="1"
        style={resetButtonStyle}
      >
        {zoomPercentage}%
      </IconButton>
      <IconButton
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        onClick={onZoomIn}
        disabled={isZoomInDisabled}
        variant="ghost"
        color="gray"
        size="1"
      >
        <Plus size={14} />
      </IconButton>
    </Flex>
  );
}
