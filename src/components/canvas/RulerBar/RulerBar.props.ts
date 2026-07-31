type TLengthUnit = 'mm' | 'cm' | 'm';

type TCanvasRulersProps = {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  documentScale: number;
  documentUnits: TLengthUnit;
  cursor?: { x: number; y: number } | null;
};

type TTick = {
  screenPos: number;
  isMajor: boolean;
  label: string;
};

export type { TCanvasRulersProps, TTick };
