import type Konva from 'konva'
import type { Shape, ShapeId } from '~/types/document'

export interface ShapeInteraction {
  registerNode: (id: ShapeId, node: Konva.Node | null) => void
  selectShape: (id: ShapeId) => void
  handleDragStart: (shape: Shape) => void
  handleDragMove: (shape: Shape, node: Konva.Node) => void
  handleDragEnd: (shape: Shape, node: Konva.Node) => void
  handleManualMouseDown: (shape: Shape, e: Konva.KonvaEventObject<MouseEvent>) => void
}

export interface ViewBounds {
  left: number
  top: number
  right: number
  bottom: number
}

/** Renders shapes read-only: no click/drag handlers attached, nodes not registered anywhere. */
export const noopShapeInteraction: ShapeInteraction = {
  registerNode: () => {},
  selectShape: () => {},
  handleDragStart: () => {},
  handleDragMove: () => {},
  handleDragEnd: () => {},
  handleManualMouseDown: () => {},
}
