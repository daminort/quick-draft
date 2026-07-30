import { useCallback, useEffect, useRef, useState } from 'react';

import { MIDDLE_MOUSE_BUTTON } from '~/constants/canvas';

import { viewStore, viewActions } from '~/stores/viewStore';

import type { TUseCanvasPanReturn } from './types';
import type Konva from 'konva';

export function useCanvasPan(): TUseCanvasPanReturn {
  const [isPanning, setIsPanning] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isPanning) {
      return;
    }

    function onWindowMouseMove(e: MouseEvent) {
      if (!lastPointer.current) {
        return;
      }
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      const { scale, x, y } = viewStore.getState();
      viewActions.setView({ scale, x: x + dx, y: y + dy });
    }

    function onWindowMouseUp() {
      lastPointer.current = null;
      setIsPanning(false);
    }

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [isPanning]);

  const onMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>): boolean => {
    if (e.evt.button !== MIDDLE_MOUSE_BUTTON) {
      return false;
    }
    e.evt.preventDefault();
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
    setIsPanning(true);
    return true;
  }, []);

  return { isPanning, onMouseDown };
}
