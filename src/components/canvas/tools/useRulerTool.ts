import { useCallback, useEffect, useRef, useState } from 'react';

import { collectSnapTargets, snapPoint } from '~/lib/snap';
import {
  rulerDirection,
  rulerEndpoint,
  internalToRealLength,
  realToInternalLength,
} from '~/lib/ruler';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useToolStore } from '~/stores/useToolStore';
import { useUIStore } from '~/stores/useUIStore';
import { useViewStore } from '~/stores/useViewStore';

import type Konva from 'konva';

type Point = { x: number; y: number };

export interface RulerState {
  start: Point;
  point: Point;
  shiftLocked: boolean;
  /** Raw digits typed by the user, overriding the live mouse-driven length until cleared. */
  lengthOverride: string | null;
}

function getPointerPosition(stage: Konva.Stage): Point {
  return stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!el?.isContentEditable;
}

export function useRulerTool() {
  const activeTool = useToolStore(state => state.activeTool);
  const documentScale = useDocumentStore(state => state.document.scale);
  const shapes = useDocumentStore(state => state.document.shapes);
  const addShape = useDocumentStore(state => state.addShape);
  const guidesVisible = useUIStore(state => state.guidesVisible);
  const snapTolerance = useUIStore(state => state.snapTolerance);
  const viewScale = useViewStore(state => state.scale);

  const [ruler, setRulerState] = useState<RulerState | null>(null);
  const rulerRef = useRef<RulerState | null>(null);

  // Mirror state into a ref, same reasoning as useDrawingTool's draftShapeRef: handlers below need
  // to read the latest value synchronously (StrictMode double-invokes functional updaters, which
  // would otherwise risk committing the two guides twice for one gesture).
  const setRuler = useCallback((value: RulerState | null) => {
    rulerRef.current = value;
    setRulerState(value);
  }, []);

  useEffect(() => {
    setRuler(null);
  }, [activeTool, setRuler]);

  const snapCursor = useCallback(
    (point: Point): Point => {
      const visibleShapes = guidesVisible ? shapes : shapes.filter(shape => shape.type !== 'guide');
      const result = snapPoint(point, collectSnapTargets(visibleShapes), snapTolerance / viewScale);
      return { x: result.x, y: result.y };
    },
    [shapes, guidesVisible, snapTolerance, viewScale],
  );

  const commit = useCallback(
    (current: RulerState, clickPoint: Point, shiftLocked: boolean) => {
      const direction = rulerDirection(current.start, clickPoint, shiftLocked);
      const length =
        current.lengthOverride !== null
          ? realToInternalLength(parseFloat(current.lengthOverride), documentScale)
          : Math.hypot(clickPoint.x - current.start.x, clickPoint.y - current.start.y);

      if (!(length > 0)) {
        setRuler(null);
        return;
      }

      const endpoint = rulerEndpoint(current.start, direction, length);
      addShape({ id: crypto.randomUUID(), type: 'guide', orientation: 'h', position: endpoint.y });
      addShape({ id: crypto.randomUUID(), type: 'guide', orientation: 'v', position: endpoint.x });
      setRuler(null);
    },
    [addShape, documentScale, setRuler],
  );

  const handleMouseDown = useCallback(
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
        setRuler({ start: point, point, shiftLocked: e.evt.shiftKey, lengthOverride: null });
        return;
      }

      commit(current, point, e.evt.shiftKey);
    },
    [activeTool, snapCursor, setRuler, commit],
  );

  const handleMouseMove = useCallback(
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
      setRuler({ ...current, point, shiftLocked: e.evt.shiftKey });
    },
    [activeTool, snapCursor, setRuler],
  );

  useEffect(() => {
    if (activeTool !== 'ruler') {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
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
        commit(current, current.point, current.shiftLocked);
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    handleMouseDown,
    handleMouseMove,
  };
}
