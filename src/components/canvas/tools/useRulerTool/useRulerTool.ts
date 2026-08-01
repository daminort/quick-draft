import { useCallback, useEffect, useRef, useState } from 'react';

import { collectSnapTargets, snapPoint } from '~/lib/snap';
import {
  rulerDirection,
  rulerEndpoint,
  internalToRealLength,
  realToInternalLength,
} from '~/lib/ruler';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';
import { toolStore, toolSelectors } from '~/stores/toolStore';
import { uiStore, uiSelectors } from '~/stores/uiStore';
import { viewStore, viewSelectors } from '~/stores/viewStore';

import type { TPoint, TRulerState, TUseRulerToolReturn } from './types';
import type Konva from 'konva';

function getPointerPosition(stage: Konva.Stage): TPoint {
  return stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!el?.isContentEditable;
}

function useRulerTool(): TUseRulerToolReturn {
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const documentScale = documentStore(documentSelectors.getScale);
  const shapes = documentStore(documentSelectors.getShapes);
  const areGuidesVisible = uiStore(uiSelectors.getAreGuidesVisible);
  const snapTolerance = uiStore(uiSelectors.getSnapTolerance);
  const viewScale = viewStore(viewSelectors.getScale);

  const [ruler, setRulerState] = useState<TRulerState | null>(null);
  const [isHintDismissed, setIsHintDismissed] = useState(false);
  const rulerRef = useRef<TRulerState | null>(null);

  // Mirror state into a ref, same reasoning as useDrawingTool's draftShapeRef: handlers below need
  // to read the latest value synchronously (StrictMode double-invokes functional updaters, which
  // would otherwise risk committing the two guides twice for one gesture).
  const setRuler = useCallback((value: TRulerState | null) => {
    rulerRef.current = value;
    setRulerState(value);
  }, []);

  useEffect(() => {
    setRuler(null);
    setIsHintDismissed(false);
  }, [activeTool, setRuler]);

  const snapCursor = useCallback(
    (point: TPoint): TPoint => {
      const visibleShapes = areGuidesVisible
        ? shapes
        : shapes.filter(shape => shape.type !== 'guide');
      const result = snapPoint(point, collectSnapTargets(visibleShapes), snapTolerance / viewScale);
      return { x: result.x, y: result.y };
    },
    [shapes, areGuidesVisible, snapTolerance, viewScale],
  );

  const commit = useCallback(
    (current: TRulerState, clickPoint: TPoint, isShiftLocked: boolean) => {
      const direction = rulerDirection(current.start, clickPoint, isShiftLocked);
      const length =
        current.lengthOverride !== null
          ? realToInternalLength(parseFloat(current.lengthOverride), documentScale)
          : Math.hypot(clickPoint.x - current.start.x, clickPoint.y - current.start.y);

      if (!(length > 0)) {
        setRuler(null);
        return;
      }

      const endpoint = rulerEndpoint(current.start, direction, length);
      documentActions.addShape({
        id: crypto.randomUUID(),
        type: 'guide',
        orientation: 'h',
        position: endpoint.y,
      });
      documentActions.addShape({
        id: crypto.randomUUID(),
        type: 'guide',
        orientation: 'v',
        position: endpoint.x,
      });
      setRuler(null);
      setIsHintDismissed(true);
    },
    [documentScale, setRuler],
  );

  const onMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'ruler') {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = snapCursor(getPointerPosition(stage));
      const current = rulerRef.current;

      if (!current) {
        setRuler({ start: point, point, isShiftLocked: e.evt.shiftKey, lengthOverride: null });
        return;
      }

      commit(current, point, e.evt.shiftKey);
    },
    [activeTool, snapCursor, setRuler, commit],
  );

  const onMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'ruler') {
        return;
      }
      const current = rulerRef.current;
      if (!current) {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = snapCursor(getPointerPosition(stage));
      setRuler({ ...current, point, isShiftLocked: e.evt.shiftKey });
    },
    [activeTool, snapCursor, setRuler],
  );

  useEffect(() => {
    if (activeTool !== 'ruler') {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      const current = rulerRef.current;
      if (!current) {
        return;
      }
      if (isTypingTarget(e.target)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setRuler(null);
        return;
      }

      if (e.key === 'Enter') {
        if (current.lengthOverride === null) {
          return;
        }
        const value = parseFloat(current.lengthOverride);
        if (!(value > 0)) {
          return;
        }
        e.preventDefault();
        commit(current, current.point, current.isShiftLocked);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        const next = (current.lengthOverride ?? '').slice(0, -1);
        setRuler({ ...current, lengthOverride: next.length > 0 ? next : null });
        return;
      }

      if (/^[0-9.]$/.test(e.key)) {
        e.preventDefault();
        const base = current.lengthOverride ?? '';
        if (e.key === '.' && base.includes('.')) {
          return;
        }
        setRuler({ ...current, lengthOverride: base + e.key });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, commit, setRuler]);

  const liveLength =
    ruler === null
      ? 0
      : ruler.lengthOverride !== null
        ? parseFloat(ruler.lengthOverride) || 0
        : internalToRealLength(
            Math.hypot(ruler.point.x - ruler.start.x, ruler.point.y - ruler.start.y),
            documentScale,
          );

  return {
    draftRuler: activeTool === 'ruler' ? ruler : null,
    liveLength,
    isHintDismissed,
    onMouseDown,
    onMouseMove,
  };
}

export { useRulerTool };
