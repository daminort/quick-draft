import { viewStore } from './store';

import type { TViewState } from './types';

const viewActions = {
  setView: (view: TViewState) => {
    viewStore.setState(view);
  },
  resetZoom: () => {
    viewStore.setState({ scale: 1, x: 0, y: 0 });
  },
};

export { viewActions };
