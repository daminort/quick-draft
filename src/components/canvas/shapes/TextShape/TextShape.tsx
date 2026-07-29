import { Text } from 'react-konva';

import type { TShape } from '~/types/document';

import { SELECTED_COLOR } from '~/constants/shapes';

import type Konva from 'konva';

type TTextShapeProps = {
  shape: Extract<TShape, { type: 'text' }>;
  isDraggable: boolean;
  isSelected?: boolean;
  isVisible?: boolean;
  onSelect: () => void;
  onDblClick?: () => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (node: Konva.Node) => void;
  setNodeRef: (node: Konva.Text | null) => void;
};

export function TextShape({
  shape,
  isDraggable,
  isSelected = false,
  isVisible = true,
  onSelect,
  onDblClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  setNodeRef,
}: TTextShapeProps) {
  const fontStyle =
    [shape.isBold && 'bold', shape.isItalic && 'italic'].filter(Boolean).join(' ') || 'normal';
  const fillColor = isSelected ? SELECTED_COLOR : shape.fill;

  return (
    <Text
      ref={setNodeRef}
      id={shape.id}
      x={shape.x}
      y={shape.y}
      text={shape.text}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragStart={onDragStart}
      onDragMove={e => onDragMove(e.target)}
      onDragEnd={e => onDragEnd(e.target)}
      align={shape.align}
      fontFamily={shape.fontFamily}
      fontSize={shape.fontSize}
      fontStyle={fontStyle}
      fill={fillColor}
      visible={isVisible}
    />
  );
}
