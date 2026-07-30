import type { TSelectionState } from './types';

const selectionSelectors = {
  getSelectedIds: (state: TSelectionState) => state.selectedIds,
};

export { selectionSelectors };
