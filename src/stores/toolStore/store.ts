import { create } from 'zustand';

import type { TToolState } from './types';

export const toolStore = create<TToolState>()(() => ({
  activeTool: 'select',
}));
