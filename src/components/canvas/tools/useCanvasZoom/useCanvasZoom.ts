import { useCallback } from 'react';

import { MIN_SCALE, MAX_SCALE, WHEEL_SCALE_BY, BUTTON_SCALE_BY } from '~/constants/canvas';

import { useViewStore } from '~/stores/useViewStore';

import type { TStageSize, TUseCanvasZoomReturn } from './types';
import type Konva from 'konva';

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function useCanvasZoom(stageSize: TStageSize): TUseCanvasZoomReturn {
  const scale = useViewStore(state => state.scale);
  const x = useViewStore(state => state.x);
  const y = useViewStore(state => state.y);
  const setView = useViewStore(state => state.setView);
  const resetZoom = useViewStore(state => state.resetZoom);

  const zoomAtPoint = useCallback(
    (point: { x: number; y: number }, nextScale: number) => {
      const clamped = clampScale(nextScale);
      const documentPoint = { x: (point.x - x) / scale, y: (point.y - y) / scale };
      setView({
        scale: clamped,
        x: point.x - documentPoint.x * clamped,
        y: point.y - documentPoint.y * clamped,
      });
    },
    [scale, x, y, setView],
  );

  const onWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      if (!e.evt.ctrlKey) {
        return;
      }
      e.evt.preventDefault();

      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) {
        return;
      }

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      zoomAtPoint(pointer, direction > 0 ? scale * WHEEL_SCALE_BY : scale / WHEEL_SCALE_BY);
    },
    [scale, zoomAtPoint],
  );

  const zoomIn = useCallback(() => {
    zoomAtPoint({ x: stageSize.width / 2, y: stageSize.height / 2 }, scale * BUTTON_SCALE_BY);
  }, [zoomAtPoint, scale, stageSize.width, stageSize.height]);

  const zoomOut = useCallback(() => {
    zoomAtPoint({ x: stageSize.width / 2, y: stageSize.height / 2 }, scale / BUTTON_SCALE_BY);
  }, [zoomAtPoint, scale, stageSize.width, stageSize.height]);

  return { scale, x, y, onWheel, zoomIn, zoomOut, resetZoom };
}
