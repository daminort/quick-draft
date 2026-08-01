import { useCallback, useEffect, useState } from 'react';

import type { TShape } from '~/types/document';

import { MOVE_PREVIEW_COLOR } from '~/constants/shapes';

import { listBindablePoints } from '~/lib/bounds';
import { translateShape } from '~/lib/shapeTransform';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';
import { selectionStore, selectionSelectors, selectionActions } from '~/stores/selectionStore';
import { toolStore, toolSelectors, toolActions } from '~/stores/toolStore';

import type { TMoveOrigin, TPoint, TUseMoveToolReturn } from './types';
import type Konva from 'konva';

function getPointerPosition(stage: Konva.Stage): TPoint {
  return stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
}

/** Recolors a shape pale red for the Move tool's ghost preview. Guide/dimension render from fixed
 * constants rather than a per-shape style, and a component-instance's appearance comes from its
 * (possibly deeply nested) definition — none of these have a single color to override, so the
 * preview keeps its normal look for those. */
function withMovePreviewStyle(shape: TShape): TShape {
  switch (shape.type) {
    case 'line':
    case 'rect':
    case 'circle':
    case 'arc':
      return {
        ...shape,
        style: {
          ...shape.style,
          stroke: MOVE_PREVIEW_COLOR,
          fill: shape.style.fill !== undefined ? MOVE_PREVIEW_COLOR : undefined,
        },
      };
    case 'text':
      return { ...shape, fill: MOVE_PREVIEW_COLOR };
    default:
      return shape;
  }
}

function useMoveTool(): TUseMoveToolReturn {
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const shapes = documentStore(documentSelectors.getShapes);
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);

  const [origin, setOrigin] = useState<TMoveOrigin | null>(null);
  const [previewShape, setPreviewShape] = useState<TShape | null>(null);

  useEffect(() => {
    setOrigin(null);
    setPreviewShape(null);
  }, [activeTool]);

  const selectedShape =
    selectedIds.length === 1 ? (shapes.find(shape => shape.id === selectedIds[0]) ?? null) : null;

  const anchors =
    activeTool === 'move' && !origin && selectedShape ? listBindablePoints(selectedShape) : null;

  const onPickAnchor = useCallback(
    (point: TPoint) => {
      if (!selectedShape) {
        return;
      }
      setOrigin({ shape: selectedShape, anchor: point });
      setPreviewShape(withMovePreviewStyle(selectedShape));
    },
    [selectedShape],
  );

  const onMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'move' || !origin) {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = getPointerPosition(stage);
      const dx = point.x - origin.anchor.x;
      const dy = point.y - origin.anchor.y;
      const moved = { ...origin.shape, ...translateShape(origin.shape, dx, dy) } as TShape;
      setPreviewShape(withMovePreviewStyle(moved));
    },
    [activeTool, origin],
  );

  const onMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'move' || !origin) {
        return;
      }
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const point = getPointerPosition(stage);
      const dx = point.x - origin.anchor.x;
      const dy = point.y - origin.anchor.y;
      documentActions.updateShape(origin.shape.id, translateShape(origin.shape, dx, dy));
      setOrigin(null);
      setPreviewShape(null);
      selectionActions.select([origin.shape.id]);
      toolActions.setTool('select');
    },
    [activeTool, origin],
  );

  return { anchors, previewShape, onPickAnchor, onMouseDown, onMouseMove };
}

export { useMoveTool };
