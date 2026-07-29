import { create } from 'zustand';

import type { ShapeId } from '~/types/document';

interface SelectionStore {
  selectedIds: ShapeId[];
  select: (ids: ShapeId[]) => void;
  toggle: (id: ShapeId) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionStore>()(set => ({
  selectedIds: [],
  select: ids => set({ selectedIds: ids }),
  toggle: id =>
    set(state => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter(selectedId => selectedId !== id)
        : [...state.selectedIds, id],
    })),
  clear: () => set({ selectedIds: [] }),
}));
