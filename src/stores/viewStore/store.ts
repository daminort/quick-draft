import { create } from 'zustand';

import type { TViewState } from './types';

export const viewStore = create<TViewState>()(() => ({
  scale: 1,
  x: 0,
  y: 0,
}));
