import { create } from 'zustand';

export type TTool =
  'select' | 'line' | 'rect' | 'circle' | 'arc' | 'text' | 'guide' | 'dimension' | 'ruler';

type TToolStore = {
  activeTool: TTool;
  setTool: (tool: TTool) => void;
};

export const useToolStore = create<TToolStore>()(set => ({
  activeTool: 'select',
  setTool: tool => set({ activeTool: tool }),
}));
