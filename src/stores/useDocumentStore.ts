import { create } from 'zustand'
import { temporal } from 'zundo'
import { getUnionBounds } from '~/lib/bounds'
import { translateShape, flattenComponentInstance } from '~/lib/shapeTransform'
import { resyncDimensionBindings } from '~/lib/dimensionBinding'
import { saveCurrentDocument } from '~/lib/persistence/indexedDb'
import type { ComponentDef, Document, Shape, ShapeId, ShapePatch } from '~/types/document'

interface DocumentStore {
  document: Document
  addShape: (shape: Shape) => void
  updateShape: (id: ShapeId, patch: ShapePatch) => void
  removeShape: (id: ShapeId) => void
  bringToFront: (id: ShapeId) => void
  sendToBack: (id: ShapeId) => void
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
  /** Replaces the whole document (e.g. loading a .json file or restoring an autosave) as a fresh
   * snapshot rather than an undoable edit — the undo history is reset along with it. */
  loadDocument: (doc: Document) => void
  /**
   * Merges imported component definitions into the library. An id that already exists locally is
   * kept as a separate entry under a freshly generated id, rather than silently overwriting it.
   */
  importComponents: (defs: ComponentDef[]) => void
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
      set((state) => {
        const shapes = state.document.shapes.map((shape) =>
          shape.id === id ? ({ ...shape, ...patch } as Shape) : shape,
        )
        return { document: { ...state.document, shapes: resyncDimensionBindings(shapes) } }
      }),
    removeShape: (id) =>
      set((state) => {
        const shapes = state.document.shapes
          .filter((shape) => shape.id !== id)
          .map((shape) => {
            if (shape.type !== 'dimension') return shape
            const bindingA = shape.bindingA?.shapeId === id ? null : shape.bindingA
            const bindingB = shape.bindingB?.shapeId === id ? null : shape.bindingB
            return bindingA === shape.bindingA && bindingB === shape.bindingB
              ? shape
              : { ...shape, bindingA, bindingB }
          })
        return { document: { ...state.document, shapes } }
      }),
    bringToFront: (id) =>
      set((state) => {
        const shape = state.document.shapes.find((s) => s.id === id)
        if (!shape) return state
        return {
          document: {
            ...state.document,
            shapes: [...state.document.shapes.filter((s) => s.id !== id), shape],
          },
        }
      }),
    sendToBack: (id) =>
      set((state) => {
        const shape = state.document.shapes.find((s) => s.id === id)
        if (!shape) return state
        return {
          document: {
            ...state.document,
            shapes: [shape, ...state.document.shapes.filter((s) => s.id !== id)],
          },
        }
      }),
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
    loadDocument: (doc) => {
      set({ document: doc })
      useDocumentStore.temporal.getState().clear()
    },
    importComponents: (defs) => {
      set((state) => {
        const components = { ...state.document.components }
        for (const def of defs) {
          const id = components[def.id] ? crypto.randomUUID() : def.id
          components[id] = { ...def, id }
        }
        return { document: { ...state.document, components } }
      })
    },
  })),
)

const AUTOSAVE_DEBOUNCE_MS = 800
let autosaveTimer: ReturnType<typeof setTimeout> | undefined
useDocumentStore.subscribe((state) => {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    void saveCurrentDocument(state.document)
  }, AUTOSAVE_DEBOUNCE_MS)
})
