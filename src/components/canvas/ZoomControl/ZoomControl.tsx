import { Flex, IconButton } from '@radix-ui/themes';
import { Minus, Plus } from 'lucide-react';

import { MIN_SCALE, MAX_SCALE } from '~/constants/canvas';

import s from './ZoomControl.module.css';

type TZoomControlProps = {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

function ZoomControl({ scale, onZoomIn, onZoomOut, onReset }: TZoomControlProps) {
  const isZoomOutDisabled = scale <= MIN_SCALE;
  const isZoomInDisabled = scale >= MAX_SCALE;
  const zoomPercentage = Math.round(scale * 100);

  return (
    <Flex align="center" gap="1" p="1" className={s.container}>
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
        className={s.resetButton}
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

export { ZoomControl };
