import { create } from 'zustand'
import { temporal } from 'zundo'
import { getUnionBounds } from '~/lib/bounds'
import { translateShape, flattenComponentInstance } from '~/lib/shapeTransform'
import type { ComponentDef, Document, Shape, ShapeId, ShapePatch } from '~/types/document'

interface DocumentStore {
  document: Document
  addShape: (shape: Shape) => void
  updateShape: (id: ShapeId, patch: ShapePatch) => void
  removeShape: (id: ShapeId) => void
  clear: () => void
  clearGuides: () => void
  setUnits: (units: Document['units']) => void
  createComponent: (shapeIds: ShapeId[], name: string) => ShapeId | null
  addComponentInstance: (componentId: string, x: number, y: number) => ShapeId
  /**
   * Removes a component definition from the library. Existing instances are not deleted — each is
   * baked into independent shapes in place, so canvas content never disappears when the library
   * entry does. Returns a map from each replaced instance's old id to its new shapes' ids.
   */
  removeComponent: (componentId: string) => Record<ShapeId, ShapeId[]>
}

const initialDocument: Document = {
  shapes: [],
  components: {},
  units: 'mm',
  scale: 1,
}

export const useDocumentStore = create<DocumentStore>()(
  temporal((set, get) => ({
    document: initialDocument,
    addShape: (shape) =>
      set((state) => ({
        document: { ...state.document, shapes: [...state.document.shapes, shape] },
      })),
    updateShape: (id, patch) =>
      set((state) => ({
        document: {
          ...state.document,
          shapes: state.document.shapes.map((shape) =>
            shape.id === id ? ({ ...shape, ...patch } as Shape) : shape,
          ),
        },
      })),
    removeShape: (id) =>
      set((state) => ({
        document: {
          ...state.document,
          shapes: state.document.shapes.filter((shape) => shape.id !== id),
        },
      })),
    clear: () =>
      set((state) => ({
        document: { ...state.document, shapes: [] },
      })),
    clearGuides: () =>
      set((state) => ({
        document: {
          ...state.document,
          shapes: state.document.shapes.filter((shape) => shape.type !== 'guide'),
        },
      })),
    setUnits: (units) =>
      set((state) => ({
        document: { ...state.document, units },
      })),
    createComponent: (shapeIds, name) => {
      const { document } = get()
      const shapes = document.shapes.filter((shape) => shapeIds.includes(shape.id))
      if (shapes.length === 0) return null

      const bounds = getUnionBounds(shapes, document.components)
      const anchor = bounds ? { x: bounds.x1, y: bounds.y1 } : { x: 0, y: 0 }
      const componentShapes = shapes.map(
        (shape) => ({ ...shape, ...translateShape(shape, -anchor.x, -anchor.y) }) as Shape,
      )

      const componentId = crypto.randomUUID()
      const componentDef: ComponentDef = { id: componentId, name, shapes: componentShapes }

      const instanceId = crypto.randomUUID()
      const instance: Shape = {
        id: instanceId,
        type: 'component-instance',
        componentId,
        x: anchor.x,
        y: anchor.y,
        scale: 1,
        rotation: 0,
      }

      set((state) => ({
        document: {
          ...state.document,
          components: { ...state.document.components, [componentId]: componentDef },
          shapes: [
            ...state.document.shapes.filter((shape) => !shapeIds.includes(shape.id)),
            instance,
          ],
        },
      }))

      return instanceId
    },
    addComponentInstance: (componentId, x, y) => {
      const instanceId = crypto.randomUUID()
      const instance: Shape = {
        id: instanceId,
        type: 'component-instance',
        componentId,
        x,
        y,
        scale: 1,
        rotation: 0,
      }
      set((state) => ({
        document: { ...state.document, shapes: [...state.document.shapes, instance] },
      }))
      return instanceId
    },
    removeComponent: (componentId) => {
      const { document } = get()
      const componentDef = document.components[componentId]
      const components = { ...document.components }
      delete components[componentId]

      const replacedBy: Record<ShapeId, ShapeId[]> = {}
      const shapes = document.shapes.flatMap((shape) => {
        if (shape.type === 'component-instance' && shape.componentId === componentId) {
          const flattened = componentDef ? flattenComponentInstance(shape, componentDef) : []
          replacedBy[shape.id] = flattened.map((flattenedShape) => flattenedShape.id)
          return flattened
        }
        return [shape]
      })

      set((state) => ({ document: { ...state.document, components, shapes } }))
      return replacedBy
    },
  })),
)
