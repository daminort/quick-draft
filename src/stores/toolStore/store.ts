import { create } from 'zustand';

import type { TToolState } from './types';

const toolStore = create<TToolState>()(() => ({
  activeTool: 'select',
}));

export { toolStore };
