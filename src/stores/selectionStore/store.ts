import { create } from 'zustand';

import type { TSelectionState } from './types';

const selectionStore = create<TSelectionState>()(() => ({
  selectedIds: [],
}));

export { selectionStore };
