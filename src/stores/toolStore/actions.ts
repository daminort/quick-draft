import { toolStore } from './store';

import type { TTool } from './types';

const toolActions = {
  setTool: (tool: TTool) => {
    toolStore.setState({ activeTool: tool });
  },
};

export { toolActions };
