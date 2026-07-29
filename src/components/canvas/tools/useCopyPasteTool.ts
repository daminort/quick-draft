import { useCallback, useEffect, useRef } from 'react';

import type { TShape, TShapeId } from '~/types/document';

import { getUnionBounds } from '~/lib/bounds';
import { translateShape } from '~/lib/shapeTransform';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useSelectionStore } from '~/stores/useSelectionStore';

import type Konva from 'konva';

type TPoint = { x: number; y: number };

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(el?.isContentEditable)
  );
}

/** Remaps a pasted dimension's bindings onto the pasted copies of their targets, or drops the
 * binding when its target wasn't copied along with it (rather than letting it keep tracking the
 * original shape's position). */
function remapDimensionBindings(shape: TShape, idMap: Map<TShapeId, TShapeId>): TShape {
  if (shape.type !== 'dimension') {
    return shape;
  }
  const bindingA =
    shape.bindingA && idMap.has(shape.bindingA.shapeId)
      ? { ...shape.bindingA, shapeId: idMap.get(shape.bindingA.shapeId)! }
      : null;
  const bindingB =
    shape.bindingB && idMap.has(shape.bindingB.shapeId)
      ? { ...shape.bindingB, shapeId: idMap.get(shape.bindingB.shapeId)! }
      : null;
  return { ...shape, bindingA, bindingB };
}

export function useCopyPasteTool() {
  const shapes = useDocumentStore(state => state.document.shapes);
  const components = useDocumentStore(state => state.document.components);
  const addShape = useDocumentStore(state => state.addShape);
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const select = useSelectionStore(state => state.select);

  const clipboard = useRef<TShape[]>([]);
  const pointer = useRef<TPoint | null>(null);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const next = stage?.getRelativePointerPosition();
    if (next) {
      pointer.current = next;
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key !== 'c' && key !== 'v') {
        return;
      }
      if (isEditableTarget(e.target)) {
        return;
      }

      if (key === 'c') {
        if (selectedIds.length === 0) {
          return;
        }
        const selected = shapes.filter(shape => selectedIds.includes(shape.id));
        if (selected.length === 0) {
          return;
        }
        e.preventDefault();
        clipboard.current = structuredClone(selected);
        return;
      }

      if (clipboard.current.length === 0) {
        return;
      }
      const point = pointer.current;
      if (!point) {
        return;
      }
      e.preventDefault();

      const bounds = getUnionBounds(clipboard.current, components);
      const anchor = bounds ? { x: bounds.x1, y: bounds.y1 } : { x: 0, y: 0 };
      const dx = point.x - anchor.x;
      const dy = point.y - anchor.y;

      const idMap = new Map<TShapeId, TShapeId>(
        clipboard.current.map(shape => [shape.id, crypto.randomUUID()]),
      );
      const pasted = clipboard.current.map(shape => {
        const translated = translateShape(shape, dx, dy);
        const moved = { ...shape, ...translated, id: idMap.get(shape.id)! } as TShape;
        return remapDimensionBindings(moved, idMap);
      });

      pasted.forEach(shape => addShape(shape));
      // Deferred: pasted nodes register their Konva ref one render after this one — selecting a
      // tick later (as handleComponentDrop already does) lets the Transformer find them immediately.
      const pastedIds = pasted.map(shape => shape.id);
      setTimeout(() => select(pastedIds), 0);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shapes, selectedIds, components, addShape, select]);

  return { handleMouseMove };
}
