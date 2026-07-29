import { useCallback, useEffect, useRef, useState } from 'react';

import type { Shape } from '~/types/document';

import {
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_CONTENT,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_ARC_END_ANGLE,
  DEFAULT_DIMENSION_AXIS,
} from '~/constants/shapes';

import { collectSnapTargets, snapPoint } from '~/lib/snap';
import { findBindingForPoint } from '~/lib/dimensionBinding';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useSelectionStore } from '~/stores/useSelectionStore';
import { useToolStore } from '~/stores/useToolStore';
import { useUIStore } from '~/stores/useUIStore';
import { useViewStore } from '~/stores/useViewStore';

import type Konva from 'konva';

type Point = { x: number; y: number };
type ArcPhase = 'radius' | 'angle';
type DimensionPhase = 'second-point';
type SnapIndicator = { x: number | null; y: number | null };

const NO_SNAP: SnapIndicator = { x: null, y: null };

function getPointerPosition(stage: Konva.Stage): Point {
  return stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
}

function angleBetween(center: Point, point: Point): number {
  return (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
}

function hasSize(shape: Shape): boolean {
  switch (shape.type) {
    case 'line':
      return shape.x1 !== shape.x2 || shape.y1 !== shape.y2;
    case 'rect':
      return shape.w > 0 && shape.h > 0;
    case 'circle':
      return shape.r > 0;
    case 'arc':
      return shape.r > 0;
    case 'dimension':
      return shape.axis === 'vertical' ? shape.y1 !== shape.y2 : shape.x1 !== shape.x2;
    default:
      return false;
  }
}

export function useDrawingTool() {
  const activeTool = useToolStore(state => state.activeTool);
  const setTool = useToolStore(state => state.setTool);
  const doc = useDocumentStore(state => state.document);
  const addShape = useDocumentStore(state => state.addShape);
  const selectShape = useSelectionStore(state => state.select);
  const guidesVisible = useUIStore(state => state.guidesVisible);
  const snapTolerance = useUIStore(state => state.snapTolerance);
  const viewScale = useViewStore(state => state.scale);
  const [draftShape, setDraftShapeState] = useState<Shape | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>(NO_SNAP);
  const draftShapeRef = useRef<Shape | null>(null);
  const startPoint = useRef<Point | null>(null);
  const arcPhase = useRef<ArcPhase | null>(null);
  const dimensionPhase = useRef<DimensionPhase | null>(null);
  const dimensionPointA = useRef<Point | null>(null);

  // Plain setter (not a functional updater) so the "current draft" is always read from
  // draftShapeRef instead — React 18 StrictMode intentionally invokes functional setState
  // updaters twice in development, and every handler below that commits a shape (addShape/
  // selectShape/setTool) used to live inside one, which could fire those side effects twice
  // per gesture and produce duplicate shapes.
  const setDraftShape = useCallback((value: Shape | null) => {
    draftShapeRef.current = value;
    setDraftShapeState(value);
  }, []);

  useEffect(() => {
    setDraftShape(null);
    setSnapIndicator(NO_SNAP);
    startPoint.current = null;
    arcPhase.current = null;
    dimensionPhase.current = null;
    dimensionPointA.current = null;
  }, [activeTool, setDraftShape]);

  const snapCursor = useCallback(
    (point: Point): Point => {
      const shapes = guidesVisible
        ? doc.shapes
        : doc.shapes.filter(shape => shape.type !== 'guide');
      const result = snapPoint(point, collectSnapTargets(shapes), snapTolerance / viewScale);
      setSnapIndicator({
        x: result.snappedX ? result.x : null,
        y: result.snappedY ? result.y : null,
      });
      return { x: result.x, y: result.y };
    },
    [doc.shapes, guidesVisible, snapTolerance, viewScale],
  );

  const handleArcMouseDown = useCallback(
    (point: Point) => {
      if (!arcPhase.current) {
        const id = crypto.randomUUID();
        arcPhase.current = 'radius';
        setDraftShape({
          id,
          type: 'arc',
          cx: point.x,
          cy: point.y,
          r: 0,
          startAngle: 0,
          endAngle: DEFAULT_ARC_END_ANGLE,
          style: DEFAULT_SHAPE_STYLE,
        });
        return;
      }

      const current = draftShapeRef.current;
      if (!current || current.type !== 'arc') {
        return;
      }

      if (arcPhase.current === 'radius') {
        const r = Math.hypot(point.x - current.cx, point.y - current.cy);
        const startAngle = angleBetween({ x: current.cx, y: current.cy }, point);
        arcPhase.current = 'angle';
        setDraftShape({ ...current, r, startAngle, endAngle: startAngle });
        return;
      }

      const endAngle = angleBetween({ x: current.cx, y: current.cy }, point);
      const finalShape = { ...current, endAngle };
      if (hasSize(finalShape)) {
        addShape(finalShape);
      }
      arcPhase.current = null;
      setDraftShape(null);
    },
    [addShape, setDraftShape],
  );

  const handleDimensionMouseDown = useCallback(
    (point: Point) => {
      if (!dimensionPhase.current) {
        dimensionPointA.current = point;
        dimensionPhase.current = 'second-point';
        return;
      }

      const a = dimensionPointA.current;
      if (!a) {
        dimensionPhase.current = null;
        return;
      }

      const id = crypto.randomUUID();
      startPoint.current = point;
      setDraftShape({
        id,
        type: 'dimension',
        x1: a.x,
        y1: a.y,
        x2: point.x,
        y2: point.y,
        axis: DEFAULT_DIMENSION_AXIS,
        offset: 0,
        unit: doc.units,
        bindingA: findBindingForPoint(doc.shapes, a),
        bindingB: findBindingForPoint(doc.shapes, point),
      });
    },
    [doc.shapes, doc.units, setDraftShape],
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'select') {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = snapCursor(getPointerPosition(stage));

      if (activeTool === 'arc') {
        handleArcMouseDown(point);
        return;
      }

      if (activeTool === 'dimension') {
        handleDimensionMouseDown(point);
        return;
      }

      if (activeTool === 'text') {
        const id = crypto.randomUUID();
        addShape({
          id,
          type: 'text',
          x: point.x,
          y: point.y,
          text: DEFAULT_TEXT_CONTENT,
          fontFamily: DEFAULT_TEXT_FONT_FAMILY,
          fontSize: DEFAULT_TEXT_FONT_SIZE,
          bold: false,
          italic: false,
          fill: DEFAULT_TEXT_COLOR,
          align: DEFAULT_TEXT_ALIGN,
        });
        selectShape([id]);
        setTool('select');
        return;
      }

      if (activeTool === 'guide') {
        const id = crypto.randomUUID();
        const orientation = e.evt.shiftKey ? 'v' : 'h';
        addShape({
          id,
          type: 'guide',
          orientation,
          position: orientation === 'v' ? point.x : point.y,
        });
        return;
      }

      const id = crypto.randomUUID();
      startPoint.current = point;

      if (activeTool === 'line') {
        setDraftShape({
          id,
          type: 'line',
          x1: point.x,
          y1: point.y,
          x2: point.x,
          y2: point.y,
          style: DEFAULT_SHAPE_STYLE,
        });
      } else if (activeTool === 'rect') {
        setDraftShape({
          id,
          type: 'rect',
          x: point.x,
          y: point.y,
          w: 0,
          h: 0,
          rotation: 0,
          style: DEFAULT_SHAPE_STYLE,
        });
      } else if (activeTool === 'circle') {
        setDraftShape({
          id,
          type: 'circle',
          cx: point.x,
          cy: point.y,
          r: 0,
          style: DEFAULT_SHAPE_STYLE,
        });
      }
    },
    [
      activeTool,
      handleArcMouseDown,
      handleDimensionMouseDown,
      addShape,
      selectShape,
      setTool,
      snapCursor,
      setDraftShape,
    ],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = snapCursor(getPointerPosition(stage));

      if (activeTool === 'arc') {
        const current = draftShapeRef.current;
        if (!current || current.type !== 'arc' || !arcPhase.current) {
          return;
        }
        const center = { x: current.cx, y: current.cy };

        if (arcPhase.current === 'radius') {
          setDraftShape({ ...current, r: Math.hypot(point.x - center.x, point.y - center.y) });
        } else {
          setDraftShape({ ...current, endAngle: angleBetween(center, point) });
        }
        return;
      }

      const start = startPoint.current;
      if (!start) {
        return;
      }

      if (activeTool === 'dimension') {
        const current = draftShapeRef.current;
        if (!current || current.type !== 'dimension') {
          return;
        }
        const dx = point.x - start.x;
        const dy = point.y - start.y;
        if (dx === 0 && dy === 0) {
          return;
        }
        const axis = Math.abs(dx) > Math.abs(dy) ? 'vertical' : 'horizontal';
        const offset = axis === 'vertical' ? dx : dy;
        setDraftShape({ ...current, axis, offset });
        return;
      }

      const current = draftShapeRef.current;
      if (!current) {
        return;
      }

      if (current.type === 'line') {
        let x2 = point.x;
        let y2 = point.y;
        if (e.evt.shiftKey) {
          const dx = point.x - current.x1;
          const dy = point.y - current.y1;
          if (Math.abs(dx) > Math.abs(dy)) {
            y2 = current.y1;
          } else {
            x2 = current.x1;
          }
        }
        setDraftShape({ ...current, x2, y2 });
      } else if (current.type === 'rect') {
        setDraftShape({
          ...current,
          x: Math.min(start.x, point.x),
          y: Math.min(start.y, point.y),
          w: Math.abs(point.x - start.x),
          h: Math.abs(point.y - start.y),
        });
      } else if (current.type === 'circle') {
        setDraftShape({ ...current, r: Math.hypot(point.x - start.x, point.y - start.y) });
      }
    },
    [activeTool, snapCursor, setDraftShape],
  );

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'arc' || activeTool === 'guide') {
      return;
    }

    const current = draftShapeRef.current;
    if (current && hasSize(current)) {
      addShape(current);
    }
    // Only clear the dimension's two-point sequence once its drag (point B onward) has
    // actually finished — not after the first click that merely placed point A.
    if (current) {
      dimensionPhase.current = null;
      dimensionPointA.current = null;
    }
    setDraftShape(null);
    startPoint.current = null;
    setSnapIndicator(NO_SNAP);
  }, [activeTool, addShape, setDraftShape]);

  return {
    draftShape: activeTool === 'select' ? null : draftShape,
    snapIndicator,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
