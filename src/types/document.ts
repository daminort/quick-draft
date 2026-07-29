export type TShapeId = string;

export type TStyle = {
  strokeWidth: number;
  stroke: string;
  fill?: string;
  fillOpacity?: number;
  dash?: number[];
};

/** A named point on a shape that a dimension's endpoint can bind to. */
export type TShapePointKey = 'p1' | 'p2' | 'tl' | 'tr' | 'br' | 'bl' | 'center' | 'origin';

export type TDimensionBinding = {
  shapeId: TShapeId;
  point: TShapePointKey;
};

export type TShape =
  | { id: TShapeId; type: 'line'; x1: number; y1: number; x2: number; y2: number; style: TStyle }
  | {
      id: TShapeId;
      type: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      style: TStyle;
    }
  | { id: TShapeId; type: 'circle'; cx: number; cy: number; r: number; style: TStyle }
  | {
      id: TShapeId;
      type: 'arc';
      cx: number;
      cy: number;
      r: number;
      startAngle: number;
      endAngle: number;
      style: TStyle;
    }
  | {
      id: TShapeId;
      type: 'dimension';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      axis: 'horizontal' | 'vertical';
      offset: number;
      unit: 'mm' | 'cm' | 'm';
      bindingA: TDimensionBinding | null;
      bindingB: TDimensionBinding | null;
    }
  | {
      id: TShapeId;
      type: 'guide';
      orientation: 'h' | 'v' | 'angle';
      position: number;
      angle?: number;
    }
  | {
      id: TShapeId;
      type: 'text';
      x: number;
      y: number;
      text: string;
      fontFamily: string;
      fontSize: number;
      bold: boolean;
      italic: boolean;
      fill: string;
      align: 'left' | 'center' | 'right';
    }
  | {
      id: TShapeId;
      type: 'component-instance';
      componentId: string;
      x: number;
      y: number;
      scale: number;
      rotation: number;
    };

type TDistributivePartial<T> = T extends unknown ? Partial<T> : never;

export type TShapePatch = TDistributivePartial<TShape>;

export type TComponentDef = {
  id: string;
  name: string;
  shapes: TShape[];
};

export type TDocument = {
  shapes: TShape[];
  components: Record<string, TComponentDef>;
  units: 'mm' | 'cm' | 'm';
  scale: number;
};
