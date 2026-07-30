import type { TDocumentState } from './types';

export const documentSelectors = {
  getDocument: (state: TDocumentState) => state.document,
  getShapes: (state: TDocumentState) => state.document.shapes,
  getComponents: (state: TDocumentState) => state.document.components,
  getComponentById: (componentId: string) => (state: TDocumentState) =>
    state.document.components[componentId],
  getUnits: (state: TDocumentState) => state.document.units,
  getScale: (state: TDocumentState) => state.document.scale,
};
