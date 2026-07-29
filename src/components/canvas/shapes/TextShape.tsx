import { Text } from 'react-konva';

import type { Shape } from '~/types/document';

import { SELECTED_COLOR } from '~/constants/shapes';

import type Konva from 'konva';

interface TextShapeProps {
  shape: Extract<Shape, { type: 'text' }>;
  draggable: boolean;
  selected?: boolean;
  visible?: boolean;
  onSelect: () => void;
  onDblClick?: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Text | null) => void;
}

export function TextShape({
  shape,
  draggable,
  selected = false,
  visible = true,
  onSelect,
  onDblClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TextShapeProps) {
  const fontStyle =
    [shape.bold && 'bold', shape.italic && 'italic'].filter(Boolean).join(' ') || 'normal';

  return (
    <Text
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      text={shape.text}
      align={shape.align}
      fontFamily={shape.fontFamily}
      fontSize={shape.fontSize}
      fontStyle={fontStyle}
      fill={selected ? SELECTED_COLOR : shape.fill}
      draggable={draggable}
      visible={visible}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragStart={onDragStart}
      onDragMove={e => onDragMove(e.target)}
      onDragEnd={e => onDragEnd(e.target)}
    />
  );
}
