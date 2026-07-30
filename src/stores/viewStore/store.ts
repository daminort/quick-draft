import { create } from 'zustand';

import type { TViewState } from './types';

const viewStore = create<TViewState>()(() => ({
  scale: 1,
  x: 0,
  y: 0,
}));

export { viewStore };
