import { create } from 'zustand'

export type Tool = 'select' | 'line' | 'rect' | 'circle' | 'arc' | 'text'

interface ToolStore {
  activeTool: Tool
  setTool: (tool: Tool) => void
}

export const useToolStore = create<ToolStore>()((set) => ({
  activeTool: 'select',
  setTool: (tool) => set({ activeTool: tool }),
}))
