import type { TToolState } from './types';

export const toolSelectors = {
  getActiveTool: (state: TToolState) => state.activeTool,
};
