import { toolStore } from './store';

import type { TTool } from './types';

export const toolActions = {
  setTool: (tool: TTool) => {
    toolStore.setState({ activeTool: tool });
  },
};
