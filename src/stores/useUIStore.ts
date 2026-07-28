import { create } from 'zustand'

interface UIStore {
  settingsOpen: boolean
  toggleSettings: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  settingsOpen: false,
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
}))
