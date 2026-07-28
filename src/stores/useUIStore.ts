import { create } from 'zustand'

export const DEFAULT_SNAP_TOLERANCE = 8

interface UIStore {
  settingsOpen: boolean
  toggleSettings: () => void
  guidesVisible: boolean
  toggleGuidesVisible: () => void
  snapTolerance: number
  setSnapTolerance: (tolerance: number) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  settingsOpen: false,
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  guidesVisible: true,
  toggleGuidesVisible: () => set((state) => ({ guidesVisible: !state.guidesVisible })),
  snapTolerance: DEFAULT_SNAP_TOLERANCE,
  setSnapTolerance: (tolerance) => set({ snapTolerance: Math.max(0, tolerance) }),
}))
