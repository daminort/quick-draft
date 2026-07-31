import { useEffect, useRef } from 'react';

import { Transformer } from 'react-konva';

import type { TShape, TShapePatch } from '~/types/document';

import { COMPONENT_INSTANCE_MIN_SCALE } from '~/constants/componentLibrary';

import { documentActions } from '~/stores/documentStore';

import { MIN_TRANSFORM_SIZE_PX } from './assets';

import type { TSelectionTransformerProps } from './SelectionTransformer.props';
import type Konva from 'konva';

function computeTransformPatch(shape: TShape, node: Konva.Node): TShapePatch {
  switch (shape.type) {
    case 'rect': {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      return {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        w: Math.max(MIN_TRANSFORM_SIZE_PX, shape.w * scaleX),
        h: Math.max(MIN_TRANSFORM_SIZE_PX, shape.h * scaleY),
      };
    }
    case 'circle': {
      const scale = node.scaleX();
      node.scaleX(1);
      node.scaleY(1);
      return { cx: node.x(), cy: node.y(), r: Math.max(MIN_TRANSFORM_SIZE_PX, shape.r * scale) };
    }
    case 'component-instance': {
      const scale = node.scaleX();
      node.scaleX(1);
      node.scaleY(1);
      return {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scale: Math.max(COMPONENT_INSTANCE_MIN_SCALE, shape.scale * scale),
      };
    }
    case 'line': {
      const transform = node.getTransform();
      const p1 = transform.point({ x: 0, y: 0 });
      const p2 = transform.point({ x: shape.x2 - shape.x1, y: shape.y2 - shape.y1 });
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(0);
      node.y(0);
      return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    }
    case 'arc': {
      const center = node.getTransform().point({ x: shape.cx, y: shape.cy });
      const scale = node.scaleX();
      const rotation = node.rotation();
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(0);
      node.y(0);
      return {
        cx: center.x,
        cy: center.y,
        r: Math.max(MIN_TRANSFORM_SIZE_PX, shape.r * scale),
        startAngle: shape.startAngle + rotation,
        endAngle: shape.endAngle + rotation,
      };
    }
    default:
      return {};
  }
}

const SelectionTransformer = ({ shape, node }: TSelectionTransformerProps) => {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    transformerRef.current?.getLayer()?.batchDraw();
  }, [node]);

  if (
    !shape ||
    !node ||
    shape.type === 'text' ||
    shape.type === 'guide' ||
    shape.type === 'dimension'
  ) {
    return null;
  }

  const isRadialShape =
    shape.type === 'circle' || shape.type === 'arc' || shape.type === 'component-instance';
  const isRotateEnabled = shape.type !== 'line';
  const enabledAnchors = isRadialShape
    ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    : undefined;
  const onTransformEnd = () =>
    documentActions.updateShape(shape.id, computeTransformPatch(shape, node));

  return (
    <Transformer
      ref={transformerRef}
      nodes={[node]}
      onTransformEnd={onTransformEnd}
      rotateEnabled={isRotateEnabled}
      keepRatio={isRadialShape}
      enabledAnchors={enabledAnchors}
    />
  );
};

export { SelectionTransformer };
