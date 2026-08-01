import type { TShape, TShapeId } from '~/types/document';

import type { TShapeInteraction, TViewBounds } from '~/components/canvas/shapes/ShapeInteraction';

type TShapeRendererProps = {
  shape: TShape;
  isInteractive: boolean;
  interaction: TShapeInteraction;
  viewBounds: TViewBounds;
  isSelected?: boolean;
  editingTextId?: TShapeId | null;
  onStartEditText?: (id: TShapeId) => void;
  editingDimensionId?: TShapeId | null;
  onStartEditDimension?: (id: TShapeId) => void;
};

export type { TShapeRendererProps };
