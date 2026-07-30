import type { TShapeId } from '~/types/document';

import { selectionStore } from './store';

export const selectionActions = {
  select: (ids: TShapeId[]) => {
    selectionStore.setState({ selectedIds: ids });
  },
  toggle: (id: TShapeId) => {
    const { selectedIds } = selectionStore.getState();
    selectionStore.setState({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id],
    });
  },
  clear: () => {
    selectionStore.setState({ selectedIds: [] });
  },
};
