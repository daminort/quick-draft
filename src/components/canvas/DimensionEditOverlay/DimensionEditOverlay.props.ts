type TDimensionEditOverlayProps = {
  initialValue: string;
  x: number;
  y: number;
  align: 'start' | 'center' | 'end';
  baseline: 'top' | 'bottom';
  scale: number;
  offsetX: number;
  offsetY: number;
  fontSize: number;
  color: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
};

export type { TDimensionEditOverlayProps };
