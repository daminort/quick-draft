import { create } from 'zustand'

export const DEFAULT_SNAP_TOLERANCE = 8

interface UIStore {
  settingsOpen: boolean
  toggleSettings: () => void
  libraryOpen: boolean
  toggleLibrary: () => void
  guidesVisible: boolean
  toggleGuidesVisible: () => void
  snapTolerance: number
  setSnapTolerance: (tolerance: number) => void
  showDimensionUnit: boolean
  toggleShowDimensionUnit: () => void
  dimensionsVisible: boolean
  toggleDimensionsVisible: () => void
  printOpen: boolean
  openPrint: () => void
  closePrint: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  settingsOpen: false,
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen, libraryOpen: false })),
  libraryOpen: false,
  toggleLibrary: () => set((state) => ({ libraryOpen: !state.libraryOpen, settingsOpen: false })),
  guidesVisible: true,
  toggleGuidesVisible: () => set((state) => ({ guidesVisible: !state.guidesVisible })),
  snapTolerance: DEFAULT_SNAP_TOLERANCE,
  setSnapTolerance: (tolerance) => set({ snapTolerance: Math.max(0, tolerance) }),
  showDimensionUnit: false,
  toggleShowDimensionUnit: () => set((state) => ({ showDimensionUnit: !state.showDimensionUnit })),
  dimensionsVisible: true,
  toggleDimensionsVisible: () => set((state) => ({ dimensionsVisible: !state.dimensionsVisible })),
  printOpen: false,
  openPrint: () => set({ printOpen: true }),
  closePrint: () => set({ printOpen: false }),
}))
