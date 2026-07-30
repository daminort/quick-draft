import { create } from 'zustand';

import type { TSelectionState } from './types';

export const selectionStore = create<TSelectionState>()(() => ({
  selectedIds: [],
}));
