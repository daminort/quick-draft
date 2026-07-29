import { create } from 'zustand';

import type { TShapeId } from '~/types/document';

type TSelectionStore = {
  selectedIds: TShapeId[];
  select: (ids: TShapeId[]) => void;
  toggle: (id: TShapeId) => void;
  clear: () => void;
};

export const useSelectionStore = create<TSelectionStore>()(set => ({
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
