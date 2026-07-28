import { useEffect, useRef } from 'react'
import { Transformer } from 'react-konva'
import type Konva from 'konva'
import { useDocumentStore } from '~/stores/useDocumentStore'
import type { Shape, ShapePatch } from '~/types/document'

interface SelectionTransformerProps {
  shape: Shape | null
  node: Konva.Node | null
}

function computeTransformPatch(shape: Shape, node: Konva.Node): ShapePatch {
  switch (shape.type) {
    case 'rect': {
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      return {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        w: Math.max(1, shape.w * scaleX),
        h: Math.max(1, shape.h * scaleY),
      }
    }
    case 'circle': {
      const scale = node.scaleX()
      node.scaleX(1)
      node.scaleY(1)
      return { cx: node.x(), cy: node.y(), r: Math.max(1, shape.r * scale) }
    }
    case 'component-instance': {
      const scale = node.scaleX()
      node.scaleX(1)
      node.scaleY(1)
      return {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scale: Math.max(0.01, shape.scale * scale),
      }
    }
    case 'line': {
      const transform = node.getTransform()
      const p1 = transform.point({ x: 0, y: 0 })
      const p2 = transform.point({ x: shape.x2 - shape.x1, y: shape.y2 - shape.y1 })
      node.scaleX(1)
      node.scaleY(1)
      node.rotation(0)
      node.x(0)
      node.y(0)
      return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
    }
    default:
      return {}
  }
}

export function SelectionTransformer({ shape, node }: SelectionTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null)
  const updateShape = useDocumentStore((state) => state.updateShape)

  useEffect(() => {
    transformerRef.current?.getLayer()?.batchDraw()
  }, [node])

  if (
    !shape ||
    !node ||
    shape.type === 'arc' ||
    shape.type === 'text' ||
    shape.type === 'guide' ||
    shape.type === 'dimension'
  )
    return null

  return (
    <Transformer
      ref={transformerRef}
      nodes={[node]}
      rotateEnabled={shape.type !== 'line'}
      keepRatio={shape.type === 'circle' || shape.type === 'component-instance'}
      enabledAnchors={
        shape.type === 'circle' || shape.type === 'component-instance'
          ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
          : undefined
      }
      onTransformEnd={() => updateShape(shape.id, computeTransformPatch(shape, node))}
    />
  )
}
