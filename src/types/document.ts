export type ShapeId = string;

export interface Style {
  strokeWidth: number;
  stroke: string;
  fill?: string;
  fillOpacity?: number;
  dash?: number[];
}

/** A named point on a shape that a dimension's endpoint can bind to. */
export type ShapePointKey = 'p1' | 'p2' | 'tl' | 'tr' | 'br' | 'bl' | 'center' | 'origin';

export interface DimensionBinding {
  shapeId: ShapeId;
  point: ShapePointKey;
}

export type Shape =
  | { id: ShapeId; type: 'line'; x1: number; y1: number; x2: number; y2: number; style: Style }
  | {
      id: ShapeId;
      type: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      style: Style;
    }
  | { id: ShapeId; type: 'circle'; cx: number; cy: number; r: number; style: Style }
  | {
      id: ShapeId;
      type: 'arc';
      cx: number;
      cy: number;
      r: number;
      startAngle: number;
      endAngle: number;
      style: Style;
    }
  | {
      id: ShapeId;
      type: 'dimension';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      axis: 'horizontal' | 'vertical';
      offset: number;
      unit: 'mm' | 'cm' | 'm';
      bindingA: DimensionBinding | null;
      bindingB: DimensionBinding | null;
    }
  | {
      id: ShapeId;
      type: 'guide';
      orientation: 'h' | 'v' | 'angle';
      position: number;
      angle?: number;
    }
  | {
      id: ShapeId;
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
      id: ShapeId;
      type: 'component-instance';
      componentId: string;
      x: number;
      y: number;
      scale: number;
      rotation: number;
    };

type DistributivePartial<T> = T extends unknown ? Partial<T> : never;

export type ShapePatch = DistributivePartial<Shape>;

export interface ComponentDef {
  id: string;
  name: string;
  shapes: Shape[];
}

export interface Document {
  shapes: Shape[];
  components: Record<string, ComponentDef>;
  units: 'mm' | 'cm' | 'm';
  scale: number;
}
