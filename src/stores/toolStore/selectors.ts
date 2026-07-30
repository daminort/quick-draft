import type { TToolState } from './types';

const toolSelectors = {
  getActiveTool: (state: TToolState) => state.activeTool,
};

export { toolSelectors };
