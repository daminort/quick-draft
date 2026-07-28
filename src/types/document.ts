export type ShapeId = string

export interface Style {
  strokeWidth: number
  stroke: string
  fill?: string
  dash?: number[]
}

export type Shape =
  | { id: ShapeId; type: 'line'; x1: number; y1: number; x2: number; y2: number; style: Style }
  | {
      id: ShapeId
      type: 'rect'
      x: number
      y: number
      w: number
      h: number
      rotation: number
      style: Style
    }
  | { id: ShapeId; type: 'circle'; cx: number; cy: number; r: number; style: Style }
  | {
      id: ShapeId
      type: 'arc'
      cx: number
      cy: number
      r: number
      startAngle: number
      endAngle: number
      style: Style
    }
  | {
      id: ShapeId
      type: 'dimension'
      refShapeId: ShapeId
      offset: number
      unit: 'mm' | 'cm' | 'm'
    }
  | {
      id: ShapeId
      type: 'guide'
      orientation: 'h' | 'v' | 'angle'
      position: number
      angle?: number
    }
  | {
      id: ShapeId
      type: 'component-instance'
      componentId: string
      x: number
      y: number
      scale: number
      rotation: number
    }

export interface ComponentDef {
  id: string
  name: string
  shapes: Shape[]
}

export interface Document {
  shapes: Shape[]
  components: Record<string, ComponentDef>
  units: 'mm' | 'cm' | 'm'
  scale: number
}
