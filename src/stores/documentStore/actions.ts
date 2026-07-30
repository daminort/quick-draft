import type { TComponentDef, TDocument, TShape, TShapeId, TShapePatch } from '~/types/document';

import { getUnionBounds } from '~/lib/bounds';
import { translateShape, flattenComponentInstance } from '~/lib/shapeTransform';
import { resyncDimensionBindings } from '~/lib/dimensionBinding';

import { documentStore } from './store';

export const documentActions = {
  addShape: (shape: TShape) => {
    documentStore.setState(state => ({
      document: { ...state.document, shapes: [...state.document.shapes, shape] },
    }));
  },

  updateShape: (id: TShapeId, patch: TShapePatch) => {
    documentStore.setState(state => {
      const shapes = state.document.shapes.map(shape =>
        shape.id === id ? ({ ...shape, ...patch } as TShape) : shape,
      );
      return { document: { ...state.document, shapes: resyncDimensionBindings(shapes) } };
    });
  },

  removeShape: (id: TShapeId) => {
    documentStore.setState(state => {
      const shapes = state.document.shapes
        .filter(shape => shape.id !== id)
        .map(shape => {
          if (shape.type !== 'dimension') {
            return shape;
          }
          const bindingA = shape.bindingA?.shapeId === id ? null : shape.bindingA;
          const bindingB = shape.bindingB?.shapeId === id ? null : shape.bindingB;
          return bindingA === shape.bindingA && bindingB === shape.bindingB
            ? shape
            : { ...shape, bindingA, bindingB };
        });
      return { document: { ...state.document, shapes } };
    });
  },

  bringToFront: (id: TShapeId) => {
    documentStore.setState(state => {
      const shape = state.document.shapes.find(s => s.id === id);
      if (!shape) {
        return state;
      }
      return {
        document: {
          ...state.document,
          shapes: [...state.document.shapes.filter(s => s.id !== id), shape],
        },
      };
    });
  },

  sendToBack: (id: TShapeId) => {
    documentStore.setState(state => {
      const shape = state.document.shapes.find(s => s.id === id);
      if (!shape) {
        return state;
      }
      return {
        document: {
          ...state.document,
          shapes: [shape, ...state.document.shapes.filter(s => s.id !== id)],
        },
      };
    });
  },

  clear: () => {
    documentStore.setState(state => ({
      document: { ...state.document, shapes: [] },
    }));
  },

  clearGuides: () => {
    documentStore.setState(state => ({
      document: {
        ...state.document,
        shapes: state.document.shapes.filter(shape => shape.type !== 'guide'),
      },
    }));
  },

  setUnits: (units: TDocument['units']) => {
    documentStore.setState(state => ({
      document: { ...state.document, units },
    }));
  },

  createComponent: (shapeIds: TShapeId[], name: string): TShapeId | null => {
    const { document } = documentStore.getState();
    const shapes = document.shapes.filter(shape => shapeIds.includes(shape.id));
    if (shapes.length === 0) {
      return null;
    }

    const bounds = getUnionBounds(shapes, document.components);
    const anchor = bounds ? { x: bounds.x1, y: bounds.y1 } : { x: 0, y: 0 };
    const componentShapes = shapes.map(
      shape => ({ ...shape, ...translateShape(shape, -anchor.x, -anchor.y) }) as TShape,
    );

    const componentId = crypto.randomUUID();
    const componentDef: TComponentDef = { id: componentId, name, shapes: componentShapes };

    const instanceId = crypto.randomUUID();
    const instance: TShape = {
      id: instanceId,
      type: 'component-instance',
      componentId,
      x: anchor.x,
      y: anchor.y,
      scale: 1,
      rotation: 0,
    };

    documentStore.setState(state => ({
      document: {
        ...state.document,
        components: { ...state.document.components, [componentId]: componentDef },
        shapes: [...state.document.shapes.filter(shape => !shapeIds.includes(shape.id)), instance],
      },
    }));

    return instanceId;
  },

  addComponentInstance: (componentId: string, x: number, y: number): TShapeId => {
    const instanceId = crypto.randomUUID();
    const instance: TShape = {
      id: instanceId,
      type: 'component-instance',
      componentId,
      x,
      y,
      scale: 1,
      rotation: 0,
    };
    documentStore.setState(state => ({
      document: { ...state.document, shapes: [...state.document.shapes, instance] },
    }));
    return instanceId;
  },

  /**
   * Removes a component definition from the library. Existing instances are not deleted — each is
   * baked into independent shapes in place, so canvas content never disappears when the library
   * entry does. Returns a map from each replaced instance's old id to its new shapes' ids.
   */
  removeComponent: (componentId: string): Record<TShapeId, TShapeId[]> => {
    const { document } = documentStore.getState();
    const componentDef = document.components[componentId];
    const components = { ...document.components };
    delete components[componentId];

    const replacedBy: Record<TShapeId, TShapeId[]> = {};
    const shapes = document.shapes.flatMap(shape => {
      if (shape.type === 'component-instance' && shape.componentId === componentId) {
        const flattened = componentDef ? flattenComponentInstance(shape, componentDef) : [];
        replacedBy[shape.id] = flattened.map(flattenedShape => flattenedShape.id);
        return flattened;
      }
      return [shape];
    });

    documentStore.setState(state => ({ document: { ...state.document, components, shapes } }));
    return replacedBy;
  },

  /** Replaces the whole document (e.g. loading a .json file or restoring an autosave) as a fresh
   * snapshot rather than an undoable edit — the undo history is reset along with it. */
  loadDocument: (doc: TDocument) => {
    documentStore.setState({ document: doc });
    documentStore.temporal.getState().clear();
  },

  /**
   * Merges imported component definitions into the library. An id that already exists locally is
   * kept as a separate entry under a freshly generated id, rather than silently overwriting it.
   */
  importComponents: (defs: TComponentDef[]) => {
    documentStore.setState(state => {
      const components = { ...state.document.components };
      for (const def of defs) {
        const id = components[def.id] ? crypto.randomUUID() : def.id;
        components[id] = { ...def, id };
      }
      return { document: { ...state.document, components } };
    });
  },
};
