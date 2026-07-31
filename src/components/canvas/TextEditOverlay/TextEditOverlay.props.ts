import type { TShape } from '~/types/document';

type TTextEditOverlayProps = {
  shape: Extract<TShape, { type: 'text' }>;
  scale: number;
  offsetX: number;
  offsetY: number;
  onChange: (text: string) => void;
  onCommit: () => void;
  onCancel: () => void;
};

export type { TTextEditOverlayProps };
