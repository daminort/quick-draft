import type { TSelectionState } from './types';

export const selectionSelectors = {
  getSelectedIds: (state: TSelectionState) => state.selectedIds,
};
