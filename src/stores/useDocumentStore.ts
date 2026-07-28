import { create } from 'zustand'
import { temporal } from 'zundo'
import type { Document, Shape, ShapeId, ShapePatch } from '~/types/document'

interface DocumentStore {
  document: Document
  addShape: (shape: Shape) => void
  updateShape: (id: ShapeId, patch: ShapePatch) => void
  removeShape: (id: ShapeId) => void
  clear: () => void
  setUnits: (units: Document['units']) => void
}

const initialDocument: Document = {
  shapes: [],
  components: {},
  units: 'mm',
  scale: 1,
}

export const useDocumentStore = create<DocumentStore>()(
  temporal((set) => ({
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
    setUnits: (units) =>
      set((state) => ({
        document: { ...state.document, units },
      })),
  })),
)
