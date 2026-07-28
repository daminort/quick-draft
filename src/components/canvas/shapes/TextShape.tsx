import { Text } from 'react-konva'
import type Konva from 'konva'
import type { Shape } from '~/types/document'

interface TextShapeProps {
  shape: Extract<Shape, { type: 'text' }>
  draggable: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (node: Konva.Node) => void
  onDragEnd: (node: Konva.Node) => void
  setNodeRef: (node: Konva.Text | null) => void
}

export function TextShape({
  shape,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TextShapeProps) {
  const fontStyle =
    [shape.bold && 'bold', shape.italic && 'italic'].filter(Boolean).join(' ') || 'normal'

  return (
    <Text
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      text={shape.text}
      fontFamily={shape.fontFamily}
      fontSize={shape.fontSize}
      fontStyle={fontStyle}
      fill={shape.fill}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={(e) => onDragMove(e.target)}
      onDragEnd={(e) => onDragEnd(e.target)}
    />
  )
}
